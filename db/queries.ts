// ═══════════════════════════════════════════════════════════════════
// db/queries.ts
// Shared query functions used by both server functions and server routes.
// Imported by page loaders (via server functions) and /api/* routes.
// ═══════════════════════════════════════════════════════════════════

import { and, desc, eq, inArray, like, notInArray, or, sql } from "drizzle-orm";
import type { DrizzleDB, TursoClient } from "./client";
import type { SourceType, TagType } from "./schema";
import {
	alternatives,
	appDownloads,
	appSources,
	apps,
	appTags,
	comparisonPairs,
	EMBEDDING_DIMENSIONS,
	proprietaryApps,
	tags,
	VECTOR_QUERIES,
} from "./schema";

// ─── Desktop-Only Filter ─────────────────────────────────────────────
// Desktop-only = has at least one desktop platform tag but NO mobile tag.
// Single query with conditional aggregation instead of 4 nested subqueries.

function desktopOnlyAppIds(db: DrizzleDB) {
	return db
		.select({ appId: appTags.appId })
		.from(appTags)
		.innerJoin(tags, eq(appTags.tagId, tags.id))
		.where(
			or(
				inArray(tags.slug, ["desktop", "linux", "macos", "windows"]),
				inArray(tags.slug, ["android", "ios"]),
			),
		)
		.groupBy(appTags.appId)
		.having(
			sql`sum(case when ${tags.slug} in ('desktop','linux','macos','windows') then 1 else 0 end) > 0
			and sum(case when ${tags.slug} in ('android','ios') then 1 else 0 end) = 0`,
		);
}

// ─── Slim List Helper ────────────────────────────────────────────────
// List pages only need card-relevant fields. Loading full sources
// (with metadata/packageName) and all tags wastes rows.

const appCardColumns = {
	id: apps.id,
	name: apps.name,
	slug: apps.slug,
	description: apps.description,
	iconUrl: apps.iconUrl,
};

async function withSlimRelations(
	db: DrizzleDB,
	appRows: { id: string }[],
): Promise<
	{
		id: string;
		name: string;
		slug: string;
		description: string | null;
		iconUrl: string | null;
		sources: { source: string; url: string }[];
		tags: { name: string; slug: string; type: string }[];
	}[]
> {
	if (appRows.length === 0) return [];

	const appIds = appRows.map((a) => a.id);

	const [sources, platformTags] = await Promise.all([
		db
			.select({
				appId: appSources.appId,
				source: appSources.source,
				url: appSources.url,
			})
			.from(appSources)
			.where(inArray(appSources.appId, appIds)),
		db
			.select({
				appId: appTags.appId,
				name: tags.name,
				slug: tags.slug,
				type: tags.type,
			})
			.from(appTags)
			.innerJoin(tags, eq(appTags.tagId, tags.id))
			.where(and(inArray(appTags.appId, appIds), eq(tags.type, "platform"))),
	]);

	const sourcesByApp = new Map<string, { source: string; url: string }[]>();
	for (const s of sources) {
		const arr = sourcesByApp.get(s.appId) ?? [];
		arr.push({ source: s.source, url: s.url });
		sourcesByApp.set(s.appId, arr);
	}

	const tagsByApp = new Map<
		string,
		{ name: string; slug: string; type: string }[]
	>();
	for (const t of platformTags) {
		const arr = tagsByApp.get(t.appId) ?? [];
		arr.push({ name: t.name, slug: t.slug, type: t.type });
		tagsByApp.set(t.appId, arr);
	}

	return (
		appRows as ((typeof appRows)[number] & Record<string, unknown>)[]
	).map((app) => ({
		...(app as any),
		sources: sourcesByApp.get(app.id) ?? [],
		tags: tagsByApp.get(app.id) ?? [],
	}));
}

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

	const conditions: ReturnType<typeof eq>[] = [];

	// Exclude desktop-only apps
	conditions.push(notInArray(apps.id, desktopOnlyAppIds(db)));

	if (tagSlugs?.length) {
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

		conditions.push(inArray(apps.id, appIdsWithAllTags));
	}

	const rows = await db
		.select(appCardColumns)
		.from(apps)
		.where(and(...conditions))
		.limit(limit)
		.offset(offset)
		.orderBy(apps.name);

	return withSlimRelations(db, rows);
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

export async function listCategoriesWithApps(db: DrizzleDB) {
	return db
		.select({
			id: tags.id,
			name: tags.name,
			slug: tags.slug,
			type: tags.type,
		})
		.from(tags)
		.where(and(eq(tags.type, "category"), sql`${tags.appCount} > 0`))
		.orderBy(tags.name);
}

// ─── Tag / Category Page Queries ────────────────────────────────────

export async function getTagBySlug(
	db: DrizzleDB,
	slug: string,
	type?: TagType,
) {
	const conditions = [eq(tags.slug, slug)];
	if (type) conditions.push(eq(tags.type, type));

	const tag = await db
		.select({
			id: tags.id,
			name: tags.name,
			slug: tags.slug,
			type: tags.type,
			appCount: sql<number>`count(${appTags.appId})`,
		})
		.from(tags)
		.leftJoin(appTags, eq(tags.id, appTags.tagId))
		.where(and(...conditions))
		.groupBy(tags.id)
		.limit(1);

	return tag[0] ?? null;
}

export async function listAppsByTag(
	db: DrizzleDB,
	tagSlug: string,
	opts: { page?: number; limit?: number } = {},
) {
	const { page = 1, limit: rawLimit = 24 } = opts;
	const limit = Math.min(rawLimit, 100);
	const offset = (page - 1) * limit;

	const tagRow = await db
		.select({ id: tags.id })
		.from(tags)
		.where(eq(tags.slug, tagSlug))
		.limit(1);

	if (!tagRow[0]) return [];

	const appIdsWithTag = db
		.select({ appId: appTags.appId })
		.from(appTags)
		.where(eq(appTags.tagId, tagRow[0].id));

	const rows = await db
		.select(appCardColumns)
		.from(apps)
		.where(inArray(apps.id, appIdsWithTag))
		.limit(limit)
		.offset(offset)
		.orderBy(apps.name);

	return withSlimRelations(db, rows);
}

export async function listTagsWithCounts(db: DrizzleDB, type?: TagType) {
	const conditions = type ? [eq(tags.type, type)] : [];

	return db
		.select({
			id: tags.id,
			name: tags.name,
			slug: tags.slug,
			type: tags.type,
			appCount: tags.appCount,
		})
		.from(tags)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(tags.name);
}

// ─── Search Queries ─────────────────────────────────────────────────

export async function searchApps(db: DrizzleDB, query: string) {
	const pattern = `%${query}%`;

	const [appRows, propResults] = await Promise.all([
		db
			.select(appCardColumns)
			.from(apps)
			.where(
				and(
					like(apps.name, pattern),
					notInArray(apps.id, desktopOnlyAppIds(db)),
				),
			)
			.limit(20)
			.orderBy(apps.name),
		db
			.select()
			.from(proprietaryApps)
			.where(like(proprietaryApps.name, pattern))
			.limit(20)
			.orderBy(proprietaryApps.name),
	]);

	return {
		apps: await withSlimRelations(db, appRows),
		proprietaryApps: propResults,
	};
}

// ─── Discovery Queries ──────────────────────────────────────────────

export async function getRecentApps(db: DrizzleDB) {
	const rows = await db
		.select(appCardColumns)
		.from(apps)
		.where(notInArray(apps.id, desktopOnlyAppIds(db)))
		.orderBy(sql`${apps.createdAt} desc`)
		.limit(20);

	return withSlimRelations(db, rows);
}

// ─── Desktop App Queries ────────────────────────────────────────────

export async function listDesktopApps(
	db: DrizzleDB,
	opts: { page?: number; limit?: number } = {},
) {
	const { page = 1, limit: rawLimit = 24 } = opts;
	const limit = Math.min(rawLimit, 100);
	const offset = (page - 1) * limit;

	const desktopTagIds = db
		.select({ id: tags.id })
		.from(tags)
		.where(inArray(tags.slug, ["desktop", "linux", "macos", "windows"]));

	const appsWithDesktopTag = db
		.select({ appId: appTags.appId })
		.from(appTags)
		.where(inArray(appTags.tagId, desktopTagIds))
		.groupBy(appTags.appId);

	const rows = await db
		.select(appCardColumns)
		.from(apps)
		.where(inArray(apps.id, appsWithDesktopTag))
		.limit(limit)
		.offset(offset)
		.orderBy(apps.name);

	return withSlimRelations(db, rows);
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

// ─── Comparison Queries ─────────────────────────────────────────────

export async function getComparisonBySlug(db: DrizzleDB, slug: string) {
	const pair = await db.query.comparisonPairs.findFirst({
		where: eq(comparisonPairs.slug, slug),
	});
	if (!pair) return null;

	const [appA, appB] = await Promise.all([
		db.query.apps.findFirst({
			where: eq(apps.id, pair.appAId),
			with: {
				sources: true,
				tags: { with: { tag: true } },
			},
		}),
		db.query.apps.findFirst({
			where: eq(apps.id, pair.appBId),
			with: {
				sources: true,
				tags: { with: { tag: true } },
			},
		}),
	]);

	if (!appA || !appB) return null;

	const sharedTags = pair.sharedTagIds.length
		? await db.select().from(tags).where(inArray(tags.id, pair.sharedTagIds))
		: [];

	return {
		...pair,
		appA: { ...appA, tags: appA.tags.map((at) => at.tag) },
		appB: { ...appB, tags: appB.tags.map((at) => at.tag) },
		sharedTags,
	};
}

export async function listComparisonPairsForApp(
	db: DrizzleDB,
	appId: string,
	limit = 5,
) {
	const aliasA = db
		.select({
			id: apps.id,
			name: apps.name,
			slug: apps.slug,
			iconUrl: apps.iconUrl,
		})
		.from(apps)
		.as("appA");
	const aliasB = db
		.select({
			id: apps.id,
			name: apps.name,
			slug: apps.slug,
			iconUrl: apps.iconUrl,
		})
		.from(apps)
		.as("appB");

	const rows = await db
		.select({
			id: comparisonPairs.id,
			slug: comparisonPairs.slug,
			appAId: comparisonPairs.appAId,
			appBId: comparisonPairs.appBId,
			sharedTagCount: comparisonPairs.sharedTagCount,
			appAName: aliasA.name,
			appASlug: aliasA.slug,
			appAIcon: aliasA.iconUrl,
			appBName: aliasB.name,
			appBSlug: aliasB.slug,
			appBIcon: aliasB.iconUrl,
		})
		.from(comparisonPairs)
		.innerJoin(aliasA, eq(comparisonPairs.appAId, aliasA.id))
		.innerJoin(aliasB, eq(comparisonPairs.appBId, aliasB.id))
		.where(
			or(eq(comparisonPairs.appAId, appId), eq(comparisonPairs.appBId, appId)),
		)
		.orderBy(desc(comparisonPairs.sharedTagCount))
		.limit(limit);

	return rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		sharedTagCount: r.sharedTagCount,
		appA: {
			id: r.appAId,
			name: r.appAName,
			slug: r.appASlug,
			iconUrl: r.appAIcon,
		},
		appB: {
			id: r.appBId,
			name: r.appBName,
			slug: r.appBSlug,
			iconUrl: r.appBIcon,
		},
	}));
}

export async function listComparisonPairsForTag(
	db: DrizzleDB,
	tagId: string,
	limit = 10,
) {
	return db
		.select()
		.from(comparisonPairs)
		.where(
			sql`exists (select 1 from json_each(${comparisonPairs.sharedTagIds}) where value = ${tagId})`,
		)
		.orderBy(desc(comparisonPairs.sharedTagCount))
		.limit(limit);
}

export async function listAllComparisonSlugs(db: DrizzleDB) {
	return db
		.select({ slug: comparisonPairs.slug })
		.from(comparisonPairs)
		.orderBy(comparisonPairs.slug);
}

// ─── License Queries ────────────────────────────────────────────────

export async function listLicenses(db: DrizzleDB) {
	return db
		.select({
			license: apps.license,
			count: sql<number>`count(*)`,
		})
		.from(apps)
		.where(sql`${apps.license} is not null and ${apps.license} != ''`)
		.groupBy(apps.license)
		.orderBy(sql`count(*) desc`);
}

export async function listAppsByLicense(
	db: DrizzleDB,
	license: string,
	opts: { page?: number; limit?: number } = {},
) {
	const { page = 1, limit: rawLimit = 24 } = opts;
	const limit = Math.min(rawLimit, 100);
	const offset = (page - 1) * limit;

	const rows = await db
		.select(appCardColumns)
		.from(apps)
		.where(eq(apps.license, license))
		.limit(limit)
		.offset(offset)
		.orderBy(apps.name);

	return withSlimRelations(db, rows);
}

// ─── Sitemap Queries ────────────────────────────────────────────────

export async function listAllAppSlugs(db: DrizzleDB) {
	return db.select({ slug: apps.slug }).from(apps).orderBy(apps.name);
}

export async function listAllProprietaryAppSlugs(db: DrizzleDB) {
	return db
		.select({ slug: proprietaryApps.slug })
		.from(proprietaryApps)
		.orderBy(proprietaryApps.name);
}

export async function listAllTagSlugs(db: DrizzleDB, type?: TagType) {
	const conditions = type ? eq(tags.type, type) : undefined;
	return db
		.select({ slug: tags.slug, type: tags.type })
		.from(tags)
		.where(conditions)
		.orderBy(tags.name);
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

	const [appResult, propResult] = await Promise.all([
		client.execute({
			sql: VECTOR_QUERIES.searchApps,
			args: [vectorStr, vectorStr, limit],
		}),
		client.execute({
			sql: VECTOR_QUERIES.searchProprietaryApps,
			args: [vectorStr, vectorStr, limit],
		}),
	]);

	const appIds = appResult.rows.map((r) => r.app_id as string);
	const propIds = propResult.rows.map((r) => r.proprietary_app_id as string);

	const [hydratedApps, hydratedProps] = await Promise.all([
		appIds.length
			? db.query.apps.findMany({
					where: inArray(apps.id, appIds),
					with: { sources: true, tags: { with: { tag: true } } },
				})
			: [],
		propIds.length
			? db
					.select()
					.from(proprietaryApps)
					.where(inArray(proprietaryApps.id, propIds))
			: [],
	]);

	const orderedApps = appIds
		.map((id) => {
			const app = hydratedApps.find((a) => a.id === id);
			if (!app) return null;
			return { ...app, tags: app.tags.map((at) => at.tag) };
		})
		.filter(<T>(v: T | null): v is T => v !== null);

	const orderedProps = propIds
		.map((id) => hydratedProps.find((p) => p.id === id))
		.filter(<T>(v: T | undefined): v is T => v !== undefined);

	return { apps: orderedApps, proprietaryApps: orderedProps };
}

// ─── Download Tracking ──────────────────────────────────────────────

export async function recordAppDownload(
	db: DrizzleDB,
	data: { id: string; appId: string; source: SourceType },
) {
	await db.insert(appDownloads).values({
		id: data.id,
		appId: data.appId,
		source: data.source,
	});
}
