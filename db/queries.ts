// ═══════════════════════════════════════════════════════════════════
// db/queries.ts
// Shared query functions used by both server functions and server routes.
// Imported by page loaders (via server functions) and /api/* routes.
// ═══════════════════════════════════════════════════════════════════

import { eq, inArray, like, sql } from "drizzle-orm";
import type { DrizzleDB, TursoClient } from "./client";
import type { TagType } from "./schema";
import {
	alternatives,
	apps,
	appTags,
	EMBEDDING_DIMENSIONS,
	proprietaryApps,
	tags,
	VECTOR_QUERIES,
} from "./schema";

// ─── Types ──────────────────────────────────────────────────────────

export type AppWithDetails = Awaited<ReturnType<typeof getAppBySlug>>;
export type ProprietaryAppWithDetails = Awaited<
	ReturnType<typeof getProprietaryAppBySlug>
>;

// ─── App Queries ────────────────────────────────────────────────────

export async function listApps(
	db: DrizzleDB,
	opts: { tagSlugs?: string[]; page?: number; limit?: number } = {},
) {
	const { tagSlugs, page = 1, limit: rawLimit = 50 } = opts;
	const limit = Math.min(rawLimit, 100);
	const offset = (page - 1) * limit;

	const whereClause = (() => {
		if (!tagSlugs?.length) return undefined;

		const matchingTagIds = db
			.select({ id: tags.id })
			.from(tags)
			.where(inArray(tags.slug, tagSlugs));

		const appIdsWithAllTags = db
			.select({ appId: appTags.appId })
			.from(appTags)
			.where(inArray(appTags.tagId, matchingTagIds))
			.groupBy(appTags.appId)
			.having(sql`count(distinct ${appTags.tagId}) = ${tagSlugs.length}`);

		return inArray(apps.id, appIdsWithAllTags);
	})();

	return db
		.select()
		.from(apps)
		.where(whereClause)
		.limit(limit)
		.offset(offset)
		.orderBy(apps.name);
}

export async function getAppBySlug(db: DrizzleDB, slug: string) {
	const app = await db.query.apps.findFirst({
		where: eq(apps.slug, slug),
		with: {
			sources: true,
			tags: { with: { tag: true } },
		},
	});

	if (!app) return null;

	return {
		...app,
		tags: app.tags.map((at) => at.tag),
	};
}

export async function getAppAlternatives(db: DrizzleDB, appId: string) {
	const results = await db.query.alternatives.findMany({
		where: eq(alternatives.appId, appId),
		with: { proprietaryApp: true },
	});

	return results.map((r) => ({
		proprietaryApp: r.proprietaryApp,
		relationshipType: r.relationshipType,
		notes: r.notes,
	}));
}

// ─── Proprietary App Queries ────────────────────────────────────────

export async function listProprietaryApps(
	db: DrizzleDB,
	opts: { page?: number; limit?: number } = {},
) {
	const { page = 1, limit: rawLimit = 50 } = opts;
	const limit = Math.min(rawLimit, 100);
	const offset = (page - 1) * limit;

	return db
		.select()
		.from(proprietaryApps)
		.limit(limit)
		.offset(offset)
		.orderBy(proprietaryApps.name);
}

export async function getProprietaryAppBySlug(db: DrizzleDB, slug: string) {
	const propApp = await db.query.proprietaryApps.findFirst({
		where: eq(proprietaryApps.slug, slug),
		with: {
			tags: { with: { tag: true } },
		},
	});

	if (!propApp) return null;

	return {
		...propApp,
		tags: propApp.tags.map((pt) => pt.tag),
	};
}

export async function getProprietaryAppAlternatives(
	db: DrizzleDB,
	proprietaryAppId: string,
) {
	const results = await db.query.alternatives.findMany({
		where: eq(alternatives.proprietaryAppId, proprietaryAppId),
		with: {
			app: {
				with: {
					sources: true,
					tags: { with: { tag: true } },
				},
			},
		},
	});

	return results.map((r) => ({
		app: { ...r.app, tags: r.app.tags.map((at) => at.tag) },
		relationshipType: r.relationshipType,
		notes: r.notes,
	}));
}

// ─── Tag Queries ────────────────────────────────────────────────────

export async function listTags(db: DrizzleDB) {
	const allTags = await db.select().from(tags).orderBy(tags.type, tags.name);

	return allTags.reduce(
		(acc, tag) => {
			if (!acc[tag.type]) acc[tag.type] = [];
			acc[tag.type].push(tag);
			return acc;
		},
		{} as Record<string, typeof allTags>,
	);
}

export async function listTagsByType(db: DrizzleDB, type: TagType) {
	return db.select().from(tags).where(eq(tags.type, type)).orderBy(tags.name);
}

// ─── Search Queries ─────────────────────────────────────────────────

export async function searchApps(db: DrizzleDB, query: string) {
	const pattern = `%${query}%`;

	const [appResults, propResults] = await Promise.all([
		db
			.select()
			.from(apps)
			.where(like(apps.name, pattern))
			.limit(20)
			.orderBy(apps.name),
		db
			.select()
			.from(proprietaryApps)
			.where(like(proprietaryApps.name, pattern))
			.limit(20)
			.orderBy(proprietaryApps.name),
	]);

	return { apps: appResults, proprietaryApps: propResults };
}

// ─── Discovery Queries ──────────────────────────────────────────────

export async function getRecentApps(db: DrizzleDB) {
	return db.select().from(apps).orderBy(sql`${apps.createdAt} desc`).limit(20);
}

// ─── Scan Query ─────────────────────────────────────────────────────

export async function scanPackageNames(db: DrizzleDB, packageNames: string[]) {
	const matched = await db.query.proprietaryApps.findMany({
		where: inArray(proprietaryApps.packageName, packageNames),
		with: {
			alternatives: {
				with: {
					app: {
						with: {
							sources: true,
							tags: { with: { tag: true } },
						},
					},
				},
			},
			tags: { with: { tag: true } },
		},
	});

	return {
		matched: matched.map((propApp) => ({
			packageName: propApp.packageName,
			proprietaryApp: {
				...propApp,
				tags: propApp.tags.map((pt) => pt.tag),
			},
			alternatives: propApp.alternatives.map((alt) => ({
				app: { ...alt.app, tags: alt.app.tags.map((at) => at.tag) },
				relationshipType: alt.relationshipType,
				notes: alt.notes,
			})),
		})),
		unmatched: packageNames.filter(
			(pn) => !matched.some((m) => m.packageName === pn),
		),
	};
}

// ─── Vector Search Queries ──────────────────────────────────────────
// These use the raw Turso client since Drizzle doesn't support
// F32_BLOB columns or vector_top_k() natively.

export async function findSimilarApps(
	client: TursoClient,
	db: DrizzleDB,
	appId: string,
	limit = 10,
) {
	const result = await client.execute({
		sql: VECTOR_QUERIES.similarApps,
		args: [limit, appId, appId],
	});

	const similarIds = result.rows.map((r) => r.app_id as string);
	const distances = new Map(
		result.rows.map((r) => [r.app_id as string, r.distance as number]),
	);

	if (!similarIds.length) return [];

	const similarApps = await db.query.apps.findMany({
		where: inArray(apps.id, similarIds),
		with: {
			sources: true,
			tags: { with: { tag: true } },
		},
	});

	return similarIds
		.map((id) => {
			const app = similarApps.find((a) => a.id === id);
			if (!app) return null;
			return {
				app: { ...app, tags: app.tags.map((at) => at.tag) },
				distance: distances.get(id) ?? 0,
			};
		})
		.filter(Boolean);
}

export async function findSimilarProprietaryApps(
	client: TursoClient,
	db: DrizzleDB,
	proprietaryAppId: string,
	limit = 10,
) {
	const result = await client.execute({
		sql: VECTOR_QUERIES.similarProprietaryApps,
		args: [limit, proprietaryAppId, proprietaryAppId],
	});

	const similarIds = result.rows.map((r) => r.proprietary_app_id as string);
	const distances = new Map(
		result.rows.map((r) => [
			r.proprietary_app_id as string,
			r.distance as number,
		]),
	);

	if (!similarIds.length) return [];

	const similarApps = await db.query.proprietaryApps.findMany({
		where: inArray(proprietaryApps.id, similarIds),
		with: {
			tags: { with: { tag: true } },
		},
	});

	return similarIds
		.map((id) => {
			const app = similarApps.find((a) => a.id === id);
			if (!app) return null;
			return {
				proprietaryApp: { ...app, tags: app.tags.map((pt) => pt.tag) },
				distance: distances.get(id) ?? 0,
			};
		})
		.filter(Boolean);
}

export async function semanticSearch(
	client: TursoClient,
	db: DrizzleDB,
	embedding: number[],
	limit = 20,
) {
	if (embedding.length !== EMBEDDING_DIMENSIONS) {
		throw new Error(
			`Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
		);
	}

	const vectorStr = JSON.stringify(embedding);

	const result = await client.execute({
		sql: VECTOR_QUERIES.searchApps,
		args: [vectorStr, vectorStr, limit],
	});

	const appIds = result.rows.map((r) => r.app_id as string);
	const distances = new Map(
		result.rows.map((r) => [r.app_id as string, r.distance as number]),
	);

	if (!appIds.length) return [];

	const hydrated = await db.query.apps.findMany({
		where: inArray(apps.id, appIds),
		with: {
			sources: true,
			tags: { with: { tag: true } },
		},
	});

	return appIds
		.map((id) => {
			const app = hydrated.find((a) => a.id === id);
			if (!app) return null;
			return {
				app: { ...app, tags: app.tags.map((at) => at.tag) },
				distance: distances.get(id) ?? 0,
			};
		})
		.filter(Boolean);
}
