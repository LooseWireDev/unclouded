import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import type { InStatement } from "@libsql/client";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../schema";
import { appSources, apps, proprietaryApps, tags } from "../schema";
import { alternativeMappings } from "./data/alternatives";
import { appOverrides } from "./data/app-overrides";
import { proprietaryApps as proprietaryAppSeeds } from "./data/proprietary-apps";
import { fdroidAntiFeatureMap, fdroidCategoryMap, tagSeeds } from "./data/tags";
import { webApps as webAppSeeds } from "./data/web-apps";
import { deduplicateApps } from "./lib/dedup";
import { generateId } from "./lib/id";
import { sanitizeDescription } from "./lib/sanitize";
import { slugify } from "./lib/slugify";
import type { ParsedApp } from "./lib/types";
import { parseFDroidIndex } from "./parsers/fdroid";
import { parseObtainiumConfigs } from "./parsers/obtainium";

const CACHE_DIR = path.resolve(process.cwd(), ".cache");
const BATCH_SIZE = 200;

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client, { schema });

const stats = {
	fdroidParsed: 0,
	izzyParsed: 0,
	obtainiumParsed: 0,
	uniqueApps: 0,
	mergedSources: 0,
	sourcesCreated: 0,
	tagsCreated: 0,
	appTagsCreated: 0,
	proprietaryAppsCreated: 0,
	alternativesCreated: 0,
	overridesApplied: 0,
};

function parseAllSources(): ParsedApp[] {
	const allApps: ParsedApp[] = [];

	const fdroidPath = path.join(CACHE_DIR, "fdroid-index.json");
	if (fs.existsSync(fdroidPath)) {
		console.log("Parsing F-Droid index...");
		const fdroidIndex = JSON.parse(fs.readFileSync(fdroidPath, "utf-8"));
		const fdroidApps = parseFDroidIndex(fdroidIndex, "fdroid");
		stats.fdroidParsed = fdroidApps.length;
		console.log(`  ${fdroidApps.length} apps parsed`);
		allApps.push(...fdroidApps);
	} else {
		console.warn("F-Droid index not found — run seed:fetch first");
	}

	const izzyPath = path.join(CACHE_DIR, "izzy-index.json");
	if (fs.existsSync(izzyPath)) {
		console.log("Parsing IzzyOnDroid index...");
		const izzyIndex = JSON.parse(fs.readFileSync(izzyPath, "utf-8"));
		const izzyApps = parseFDroidIndex(izzyIndex, "izzyondroid");
		stats.izzyParsed = izzyApps.length;
		console.log(`  ${izzyApps.length} apps parsed`);
		allApps.push(...izzyApps);
	} else {
		console.warn("IzzyOnDroid index not found — run seed:fetch first");
	}

	const obtainiumDir = path.join(CACHE_DIR, "obtainium");
	if (fs.existsSync(obtainiumDir)) {
		console.log("Parsing Obtainium configs...");
		const obtainiumApps = parseObtainiumConfigs(obtainiumDir);
		stats.obtainiumParsed = obtainiumApps.length;
		console.log(`  ${obtainiumApps.length} configs parsed`);
		allApps.push(...obtainiumApps);
	} else {
		console.warn("Obtainium configs not found — run seed:fetch first");
	}

	return allApps;
}

async function upsertTags() {
	console.log("Upserting tags...");
	const stmts: InStatement[] = tagSeeds.map((tag) => ({
		sql: `INSERT INTO tags (id, name, slug, type) VALUES (?, ?, ?, ?)
			ON CONFLICT (slug, type) DO UPDATE SET name = excluded.name`,
		args: [generateId(), tag.name, tag.slug, tag.type],
	}));
	await client.batch(stmts, "write");
	stats.tagsCreated = tagSeeds.length;
	console.log(`  ${stats.tagsCreated} tags upserted`);
}

async function executeBatched(stmts: InStatement[]) {
	for (let i = 0; i < stmts.length; i += BATCH_SIZE) {
		const batch = stmts.slice(i, i + BATCH_SIZE);
		await client.batch(batch, "write");
	}
}

async function upsertApps(dedupedApps: ParsedApp[]) {
	console.log("Upserting apps...");

	const allTags = await db.select().from(tags);
	const tagLookup = new Map(allTags.map((t) => [t.slug, t.id]));

	// Track slug → appId for source/tag inserts
	const slugToId = new Map<string, string>();
	const now = new Date().toISOString();

	// Phase 1: Upsert all apps
	const appStmts: InStatement[] = [];
	for (const parsed of dedupedApps) {
		const slug = slugify(parsed.name);
		const override = appOverrides.find(
			(o) => o.packageName === parsed.packageName,
		);
		if (override) {
			if (override.description) parsed.description = override.description;
			if (override.websiteUrl) parsed.websiteUrl = override.websiteUrl;
			if (override.repositoryUrl) parsed.repositoryUrl = override.repositoryUrl;
			if (override.iconUrl) parsed.iconUrl = override.iconUrl;
			stats.overridesApplied++;
		}

		const appId = generateId();
		slugToId.set(slug, appId);

		appStmts.push({
			sql: `INSERT INTO apps (id, name, slug, description, icon_url, license, website_url, repository_url, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT (slug) DO UPDATE SET
					name = excluded.name,
					description = COALESCE(excluded.description, apps.description),
					icon_url = COALESCE(excluded.icon_url, apps.icon_url),
					license = COALESCE(excluded.license, apps.license),
					website_url = COALESCE(excluded.website_url, apps.website_url),
					repository_url = COALESCE(excluded.repository_url, apps.repository_url),
					updated_at = excluded.updated_at`,
			args: [
				appId,
				parsed.name,
				slug,
				sanitizeDescription(parsed.description || parsed.summary || "") || null,
				parsed.iconUrl || null,
				parsed.license || null,
				parsed.websiteUrl || null,
				parsed.repositoryUrl || null,
				now,
				now,
			],
		});
	}

	console.log(`  Inserting ${appStmts.length} apps...`);
	await executeBatched(appStmts);

	// Fetch actual IDs (some might have been updated rather than inserted)
	const allApps = await db.select({ id: apps.id, slug: apps.slug }).from(apps);
	const actualSlugToId = new Map(allApps.map((a) => [a.slug, a.id]));

	// Phase 2: Upsert sources
	const sourceStmts: InStatement[] = [];
	for (const parsed of dedupedApps) {
		const slug = slugify(parsed.name);
		const appId = actualSlugToId.get(slug);
		if (!appId) continue;

		for (const source of parsed.sources) {
			sourceStmts.push({
				sql: `INSERT INTO app_sources (id, app_id, source, url, package_name, metadata)
					VALUES (?, ?, ?, ?, ?, ?)
					ON CONFLICT (app_id, source) DO UPDATE SET
						url = excluded.url, package_name = excluded.package_name, metadata = excluded.metadata`,
				args: [
					generateId(),
					appId,
					source.source,
					source.url,
					parsed.packageName,
					source.metadata ? JSON.stringify(source.metadata) : null,
				],
			});
			stats.sourcesCreated++;
		}
	}

	// Add GitHub sources from repository_url
	let githubSourcesAdded = 0;
	for (const parsed of dedupedApps) {
		const slug = slugify(parsed.name);
		const appId = actualSlugToId.get(slug);
		if (!appId) continue;

		if (
			parsed.repositoryUrl?.includes("github.com") &&
			!parsed.sources.some((s) => s.source === "github")
		) {
			sourceStmts.push({
				sql: `INSERT INTO app_sources (id, app_id, source, url, package_name, metadata)
					VALUES (?, ?, ?, ?, ?, ?)
					ON CONFLICT (app_id, source) DO UPDATE SET
						url = excluded.url, package_name = excluded.package_name, metadata = excluded.metadata`,
				args: [
					generateId(),
					appId,
					"github",
					parsed.repositoryUrl,
					parsed.packageName,
					null,
				],
			});
			stats.sourcesCreated++;
			githubSourcesAdded++;
		}
	}

	console.log(
		`  Inserting ${sourceStmts.length} sources (${githubSourcesAdded} GitHub)...`,
	);
	await executeBatched(sourceStmts);

	// Phase 3: Upsert app tags
	const tagStmts: InStatement[] = [];
	for (const parsed of dedupedApps) {
		const slug = slugify(parsed.name);
		const appId = actualSlugToId.get(slug);
		if (!appId) continue;

		const override = appOverrides.find(
			(o) => o.packageName === parsed.packageName,
		);

		const tagSlugsToApply = new Set<string>();
		tagSlugsToApply.add("open-source");
		tagSlugsToApply.add("android");
		tagSlugsToApply.add("no-tracking");
		tagSlugsToApply.add("ad-free");

		for (const cat of parsed.categories || []) {
			const mapped = fdroidCategoryMap[cat];
			if (mapped) {
				if (Array.isArray(mapped)) {
					for (const slug of mapped) tagSlugsToApply.add(slug);
				} else {
					tagSlugsToApply.add(mapped);
				}
			}
		}

		for (const af of parsed.antiFeatures || []) {
			const mapping = fdroidAntiFeatureMap[af];
			if (mapping?.action === "remove") {
				tagSlugsToApply.delete(mapping.tag);
			}
		}

		if (override?.tags) {
			for (const tagSlug of override.tags) {
				tagSlugsToApply.add(tagSlug);
			}
		}

		for (const tagSlug of tagSlugsToApply) {
			const tagId = tagLookup.get(tagSlug);
			if (!tagId) continue;
			tagStmts.push({
				sql: "INSERT OR IGNORE INTO app_tags (app_id, tag_id) VALUES (?, ?)",
				args: [appId, tagId],
			});
			stats.appTagsCreated++;
		}
	}

	console.log(`  Inserting ${tagStmts.length} tag links...`);
	await executeBatched(tagStmts);

	console.log(
		`  ${dedupedApps.length} apps, ${stats.sourcesCreated} sources, ${stats.appTagsCreated} tag links`,
	);
}

async function upsertProprietaryApps() {
	console.log("Upserting proprietary apps...");

	const allTags = await db.select().from(tags);
	const tagLookup = new Map(allTags.map((t) => [t.slug, t.id]));
	const now = new Date().toISOString();

	const propStmts: InStatement[] = [];
	const propTagStmts: InStatement[] = [];

	for (const seed of proprietaryAppSeeds) {
		const propId = generateId();
		propStmts.push({
			sql: `INSERT INTO proprietary_apps (id, name, slug, description, icon_url, website_url, package_name, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT (slug) DO UPDATE SET
					name = excluded.name, description = excluded.description,
					icon_url = excluded.icon_url, website_url = excluded.website_url,
					package_name = excluded.package_name, updated_at = excluded.updated_at`,
			args: [
				propId,
				seed.name,
				seed.slug,
				seed.description || null,
				seed.iconUrl || null,
				seed.websiteUrl || null,
				seed.packageName || null,
				now,
				now,
			],
		});
		stats.proprietaryAppsCreated++;
	}

	await executeBatched(propStmts);

	// Fetch actual IDs
	const allProps = await db
		.select({ id: proprietaryApps.id, slug: proprietaryApps.slug })
		.from(proprietaryApps);
	const propSlugToId = new Map(allProps.map((p) => [p.slug, p.id]));

	for (const seed of proprietaryAppSeeds) {
		const propId = propSlugToId.get(seed.slug);
		if (!propId) continue;
		for (const tagSlug of seed.tags) {
			const tagId = tagLookup.get(tagSlug);
			if (!tagId) continue;
			propTagStmts.push({
				sql: "INSERT OR IGNORE INTO proprietary_app_tags (proprietary_app_id, tag_id) VALUES (?, ?)",
				args: [propId, tagId],
			});
		}
	}

	await executeBatched(propTagStmts);
	console.log(`  ${stats.proprietaryAppsCreated} proprietary apps upserted`);
}

async function upsertWebApps() {
	console.log("Upserting web/desktop apps...");

	const allTags = await db.select().from(tags);
	const tagLookup = new Map(allTags.map((t) => [t.slug, t.id]));
	const now = new Date().toISOString();

	const appStmts: InStatement[] = [];
	const tagStmts: InStatement[] = [];

	for (const seed of webAppSeeds) {
		appStmts.push({
			sql: `INSERT INTO apps (id, name, slug, description, website_url, repository_url, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT (slug) DO UPDATE SET
					name = excluded.name,
					description = COALESCE(excluded.description, apps.description),
					website_url = COALESCE(excluded.website_url, apps.website_url),
					repository_url = COALESCE(excluded.repository_url, apps.repository_url),
					updated_at = excluded.updated_at`,
			args: [
				generateId(),
				seed.name,
				seed.slug,
				sanitizeDescription(seed.description),
				seed.websiteUrl,
				seed.repositoryUrl || null,
				now,
				now,
			],
		});
	}

	await executeBatched(appStmts);

	// Fetch actual IDs for tag linking
	const allApps = await db.select({ id: apps.id, slug: apps.slug }).from(apps);
	const appBySlug = new Map(allApps.map((a) => [a.slug, a.id]));

	for (const seed of webAppSeeds) {
		const appId = appBySlug.get(seed.slug);
		if (!appId) continue;
		for (const tagSlug of seed.tags) {
			const tagId = tagLookup.get(tagSlug);
			if (!tagId) continue;
			tagStmts.push({
				sql: "INSERT OR IGNORE INTO app_tags (app_id, tag_id) VALUES (?, ?)",
				args: [appId, tagId],
			});
		}
	}

	await executeBatched(tagStmts);
	console.log(
		`  ${webAppSeeds.length} web/desktop apps upserted, ${tagStmts.length} tag links`,
	);
}

async function upsertAlternatives() {
	console.log("Upserting alternative mappings...");

	const allProprietaryApps = await db.select().from(proprietaryApps);
	const propLookup = new Map(allProprietaryApps.map((p) => [p.slug, p.id]));

	const allAppSrc = await db.select().from(appSources);
	const appByPackage = new Map<string, string>();
	for (const src of allAppSrc) {
		if (src.packageName) {
			appByPackage.set(src.packageName, src.appId);
		}
	}

	const allApps = await db.select().from(apps);
	const appBySlug = new Map(allApps.map((a) => [a.slug, a.id]));

	const altStmts: InStatement[] = [];

	for (const mapping of alternativeMappings) {
		const propId = propLookup.get(mapping.proprietarySlug);
		if (!propId) {
			console.warn(
				`  [skip] Proprietary app not found: ${mapping.proprietarySlug}`,
			);
			continue;
		}

		let appId: string | undefined;
		if (mapping.appPackageName) {
			appId = appByPackage.get(mapping.appPackageName);
		}
		if (!appId && mapping.appSlug) {
			appId = appBySlug.get(mapping.appSlug);
		}

		if (!appId) {
			console.warn(
				`  [skip] App not found: ${mapping.appPackageName || mapping.appSlug}`,
			);
			continue;
		}

		altStmts.push({
			sql: `INSERT INTO alternatives (id, proprietary_app_id, app_id, relationship_type, notes)
				VALUES (?, ?, ?, ?, ?)
				ON CONFLICT (proprietary_app_id, app_id) DO UPDATE SET
					relationship_type = excluded.relationship_type, notes = excluded.notes`,
			args: [
				generateId(),
				propId,
				appId,
				mapping.relationshipType,
				mapping.notes || null,
			],
		});
		stats.alternativesCreated++;
	}

	await executeBatched(altStmts);
	console.log(`  ${stats.alternativesCreated} alternative mappings upserted`);
}

async function main() {
	console.log("\nSeed import");
	console.log("═".repeat(50));

	const allApps = parseAllSources();

	console.log("Deduplicating...");
	const { apps: dedupedApps, stats: dedupStats } = deduplicateApps(allApps);
	stats.uniqueApps = dedupStats.unique;
	stats.mergedSources = dedupStats.merged;
	console.log(
		`  ${dedupStats.total} total → ${dedupStats.unique} unique (${dedupStats.merged} merged)`,
	);

	await upsertTags();
	await upsertApps(dedupedApps);
	await upsertWebApps();
	await upsertProprietaryApps();
	await upsertAlternatives();

	console.log(`\n${"═".repeat(50)}`);
	console.log("Import complete:");
	console.log(
		`  Parsed:  ${stats.fdroidParsed} F-Droid | ${stats.izzyParsed} Izzy | ${stats.obtainiumParsed} Obtainium`,
	);
	console.log(
		`  Deduped: ${stats.uniqueApps} unique (${stats.mergedSources} merged)`,
	);
	console.log(`  Sources: ${stats.sourcesCreated} source rows`);
	console.log(
		`  Tags:    ${stats.tagsCreated} tags, ${stats.appTagsCreated} tag links`,
	);
	console.log(
		`  Curated: ${stats.proprietaryAppsCreated} proprietary, ${stats.alternativesCreated} alternatives`,
	);
	if (stats.overridesApplied > 0) {
		console.log(`  Overrides: ${stats.overridesApplied} applied`);
	}
	console.log();

	client.close();
}

main().catch((err) => {
	console.error("Import failed:", err);
	client.close();
	process.exit(1);
});
