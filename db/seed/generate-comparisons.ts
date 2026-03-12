import "dotenv/config";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, getTursoClient } from "../client";
import { appSources, apps, appTags, tags } from "../schema";

const db = getDb();
const client = getTursoClient();

type AppWithTags = {
	id: string;
	slug: string;
	description: string | null;
	sourceCount: number;
	tagIds: string[];
	categoryTagIds: string[];
};

async function loadAppsWithTags(): Promise<AppWithTags[]> {
	const allApps = await db
		.select({
			id: apps.id,
			slug: apps.slug,
			description: apps.description,
		})
		.from(apps);

	const allAppTags = await db
		.select({
			appId: appTags.appId,
			tagId: appTags.tagId,
		})
		.from(appTags);

	const allSources = await db
		.select({
			appId: appSources.appId,
		})
		.from(appSources);

	const categoryTagIds = new Set(
		(
			await db
				.select({ id: tags.id })
				.from(tags)
				.where(eq(tags.type, "category"))
		).map((t) => t.id),
	);

	const tagsByApp = new Map<string, string[]>();
	for (const at of allAppTags) {
		const list = tagsByApp.get(at.appId) ?? [];
		list.push(at.tagId);
		tagsByApp.set(at.appId, list);
	}

	const sourceCountByApp = new Map<string, number>();
	for (const s of allSources) {
		sourceCountByApp.set(s.appId, (sourceCountByApp.get(s.appId) ?? 0) + 1);
	}

	return allApps.map((app) => {
		const appTagIds = tagsByApp.get(app.id) ?? [];
		return {
			id: app.id,
			slug: app.slug,
			description: app.description,
			sourceCount: sourceCountByApp.get(app.id) ?? 0,
			tagIds: appTagIds,
			categoryTagIds: appTagIds.filter((t) => categoryTagIds.has(t)),
		};
	});
}

function isEligible(app: AppWithTags): boolean {
	return (
		app.sourceCount >= 1 && !!app.description && app.description.length >= 20
	);
}

async function generatePairs() {
	console.log("Loading apps with tags...");
	const allApps = await loadAppsWithTags();
	const eligible = allApps.filter(isEligible);
	console.log(`${eligible.length} eligible apps (of ${allApps.length} total)`);

	// Group apps by category tag
	const appsByCategory = new Map<string, AppWithTags[]>();
	for (const app of eligible) {
		for (const catId of app.categoryTagIds) {
			const list = appsByCategory.get(catId) ?? [];
			list.push(app);
			appsByCategory.set(catId, list);
		}
	}

	// Generate pairs: apps sharing a category + enough tags to be meaningful
	// Strategy: collect all candidate pairs per app, keep top N by shared tag count
	const MAX_PAIRS_PER_APP = 10;
	const MIN_SHARED_TAGS = 6;

	const pairMap = new Map<
		string,
		{ appA: AppWithTags; appB: AppWithTags; sharedTagIds: Set<string> }
	>();

	// First pass: collect all qualifying pairs
	const candidatesByApp = new Map<
		string,
		Array<{ key: string; sharedCount: number }>
	>();

	for (const [, categoryApps] of appsByCategory) {
		for (let i = 0; i < categoryApps.length; i++) {
			for (let j = i + 1; j < categoryApps.length; j++) {
				const a = categoryApps[i]!;
				const b = categoryApps[j]!;

				const [appA, appB] = a.slug < b.slug ? [a, b] : [b, a];
				const key = `${appA.id}:${appB.id}`;
				if (pairMap.has(key)) continue;

				const bTagSet = new Set(appB.tagIds);
				const shared = appA.tagIds.filter((t) => bTagSet.has(t));

				if (shared.length < MIN_SHARED_TAGS) continue;

				pairMap.set(key, {
					appA,
					appB,
					sharedTagIds: new Set(shared),
				});

				// Track per-app for ranking
				for (const appId of [appA.id, appB.id]) {
					const list = candidatesByApp.get(appId) ?? [];
					list.push({ key, sharedCount: shared.length });
					candidatesByApp.set(appId, list);
				}
			}
		}
	}

	console.log(
		`Found ${pairMap.size} candidate pairs (>= ${MIN_SHARED_TAGS} shared tags)`,
	);

	// Second pass: keep only top N pairs per app
	const keepKeys = new Set<string>();
	for (const [, candidates] of candidatesByApp) {
		candidates.sort((a, b) => b.sharedCount - a.sharedCount);
		for (const c of candidates.slice(0, MAX_PAIRS_PER_APP)) {
			keepKeys.add(c.key);
		}
	}

	// Filter pairMap to only kept pairs
	for (const key of pairMap.keys()) {
		if (!keepKeys.has(key)) pairMap.delete(key);
	}

	console.log(
		`Kept ${pairMap.size} pairs after top-${MAX_PAIRS_PER_APP}-per-app filter`,
	);

	// Batch upsert
	const pairs = Array.from(pairMap.values());
	const batchSize = 100;

	let inserted = 0;
	for (let i = 0; i < pairs.length; i += batchSize) {
		const batch = pairs.slice(i, i + batchSize);
		const statements = batch.map((p) => ({
			sql: `INSERT OR REPLACE INTO comparison_pairs (id, app_a_id, app_b_id, slug, shared_tag_count, shared_tag_ids, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
			args: [
				nanoid(),
				p.appA.id,
				p.appB.id,
				`${p.appA.slug}-vs-${p.appB.slug}`,
				p.sharedTagIds.size,
				JSON.stringify(Array.from(p.sharedTagIds)),
			],
		}));

		await client.batch(statements, "write");
		inserted += batch.length;

		if (inserted % 1000 === 0 || inserted === pairs.length) {
			console.log(`  Upserted ${inserted}/${pairs.length} pairs`);
		}
	}

	console.log(`Done. ${inserted} comparison pairs in database.`);
}

generatePairs().catch((err) => {
	console.error("Failed to generate comparison pairs:", err);
	process.exit(1);
});
