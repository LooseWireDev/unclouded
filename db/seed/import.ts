import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../schema";
import {
	alternatives,
	appSources,
	apps,
	appTags,
	proprietaryApps,
	proprietaryAppTags,
	tags,
} from "../schema";
import { alternativeMappings } from "./data/alternatives";
import { appOverrides } from "./data/app-overrides";
import { proprietaryApps as proprietaryAppSeeds } from "./data/proprietary-apps";
import { fdroidAntiFeatureMap, fdroidCategoryMap, tagSeeds } from "./data/tags";
import { deduplicateApps } from "./lib/dedup";
import { generateId } from "./lib/id";
import { slugify } from "./lib/slugify";
import type { ParsedApp } from "./lib/types";
import { parseFDroidIndex } from "./parsers/fdroid";
import { parseObtainiumConfigs } from "./parsers/obtainium";

const CACHE_DIR = path.resolve(process.cwd(), ".cache");

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
	for (const tag of tagSeeds) {
		await db
			.insert(tags)
			.values({
				id: generateId(),
				name: tag.name,
				slug: tag.slug,
				type: tag.type,
			})
			.onConflictDoUpdate({
				target: [tags.slug, tags.type],
				set: { name: tag.name },
			});
		stats.tagsCreated++;
	}
	console.log(`  ${stats.tagsCreated} tags upserted`);
}

async function upsertApps(dedupedApps: ParsedApp[]) {
	console.log("Upserting apps...");

	const allTags = await db.select().from(tags);
	const tagLookup = new Map(allTags.map((t) => [t.slug, t.id]));

	for (const parsed of dedupedApps) {
		const slug = slugify(parsed.name);

		// Apply overrides
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
		const result = await db
			.insert(apps)
			.values({
				id: appId,
				name: parsed.name,
				slug,
				description: parsed.description || parsed.summary || null,
				iconUrl: parsed.iconUrl || null,
				license: parsed.license || null,
				websiteUrl: parsed.websiteUrl || null,
				repositoryUrl: parsed.repositoryUrl || null,
			})
			.onConflictDoUpdate({
				target: apps.slug,
				set: {
					name: parsed.name,
					description: sql`COALESCE(${parsed.description || parsed.summary || null}, ${apps.description})`,
					iconUrl: sql`COALESCE(${parsed.iconUrl || null}, ${apps.iconUrl})`,
					license: sql`COALESCE(${parsed.license || null}, ${apps.license})`,
					websiteUrl: sql`COALESCE(${parsed.websiteUrl || null}, ${apps.websiteUrl})`,
					repositoryUrl: sql`COALESCE(${parsed.repositoryUrl || null}, ${apps.repositoryUrl})`,
					updatedAt: new Date(),
				},
			})
			.returning({ id: apps.id });

		const insertedId = result[0]?.id || appId;

		for (const source of parsed.sources) {
			await db
				.insert(appSources)
				.values({
					id: generateId(),
					appId: insertedId,
					source: source.source,
					url: source.url,
					packageName: parsed.packageName,
					metadata: source.metadata || null,
				})
				.onConflictDoUpdate({
					target: [appSources.appId, appSources.source],
					set: {
						url: source.url,
						packageName: parsed.packageName,
						metadata: source.metadata || null,
					},
				});
			stats.sourcesCreated++;
		}

		// Build tag set
		const tagSlugsToApply = new Set<string>();
		tagSlugsToApply.add("open-source");
		tagSlugsToApply.add("android");
		tagSlugsToApply.add("no-tracking");
		tagSlugsToApply.add("ad-free");

		for (const cat of parsed.categories || []) {
			const mapped = fdroidCategoryMap[cat];
			if (mapped) tagSlugsToApply.add(mapped);
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
			await db
				.insert(appTags)
				.values({ appId: insertedId, tagId })
				.onConflictDoNothing();
			stats.appTagsCreated++;
		}
	}

	console.log(
		`  ${dedupedApps.length} apps, ${stats.sourcesCreated} sources, ${stats.appTagsCreated} tag links`,
	);
}

async function upsertProprietaryApps() {
	console.log("Upserting proprietary apps...");

	const allTags = await db.select().from(tags);
	const tagLookup = new Map(allTags.map((t) => [t.slug, t.id]));

	for (const seed of proprietaryAppSeeds) {
		const propId = generateId();
		const result = await db
			.insert(proprietaryApps)
			.values({
				id: propId,
				name: seed.name,
				slug: seed.slug,
				description: seed.description || null,
				iconUrl: seed.iconUrl || null,
				websiteUrl: seed.websiteUrl || null,
				packageName: seed.packageName || null,
			})
			.onConflictDoUpdate({
				target: proprietaryApps.slug,
				set: {
					name: seed.name,
					description: seed.description || null,
					iconUrl: seed.iconUrl || null,
					websiteUrl: seed.websiteUrl || null,
					packageName: seed.packageName || null,
					updatedAt: new Date(),
				},
			})
			.returning({ id: proprietaryApps.id });

		const insertedId = result[0]?.id || propId;

		for (const tagSlug of seed.tags) {
			const tagId = tagLookup.get(tagSlug);
			if (!tagId) continue;
			await db
				.insert(proprietaryAppTags)
				.values({ proprietaryAppId: insertedId, tagId })
				.onConflictDoNothing();
		}

		stats.proprietaryAppsCreated++;
	}

	console.log(`  ${stats.proprietaryAppsCreated} proprietary apps upserted`);
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

		await db
			.insert(alternatives)
			.values({
				id: generateId(),
				proprietaryAppId: propId,
				appId,
				relationshipType: mapping.relationshipType,
				notes: mapping.notes || null,
			})
			.onConflictDoUpdate({
				target: [alternatives.proprietaryAppId, alternatives.appId],
				set: {
					relationshipType: mapping.relationshipType,
					notes: mapping.notes || null,
				},
			});
		stats.alternativesCreated++;
	}

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
