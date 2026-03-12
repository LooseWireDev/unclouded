import { createServerFn } from "@tanstack/react-start";
import { getDb, getTursoClient } from "../../db/client";
import { embedText } from "../../db/embed";
import {
	getAppAlternatives,
	getAppBySlug,
	getComparisonBySlug,
	getProprietaryAppAlternatives,
	getProprietaryAppBySlug,
	getRecentApps,
	getTagBySlug,
	listApps,
	listAppsByLicense,
	listAppsByTag,
	listCategoriesWithApps,
	listComparisonPairsForApp,
	listDesktopApps,
	listLicenses,
	listProprietaryApps,
	listTags,
	listTagsByType,
	listTagsWithCounts,
	searchApps,
	semanticSearch,
} from "../../db/queries";
import type { TagType } from "../../db/schema";
import { getAI } from "./ai";

export const fetchApps = createServerFn({ method: "GET" })
	.inputValidator(
		(input: { tagSlugs?: string[]; page?: number; limit?: number }) => input,
	)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle's AppSourceMetadata (Record<string, unknown>) doesn't satisfy TanStack's serialization check
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return listApps(db, data);
	});

export const fetchAppBySlug = createServerFn({ method: "GET" })
	.inputValidator((input: { slug: string }) => input)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle's AppSourceMetadata (Record<string, unknown>) doesn't satisfy TanStack's serialization check
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return getAppBySlug(db, data.slug);
	});

export const fetchAppAlternatives = createServerFn({ method: "GET" })
	.inputValidator((input: { appId: string }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return getAppAlternatives(db, data.appId);
	});

export const fetchProprietaryApps = createServerFn({ method: "GET" })
	.inputValidator((input: { page?: number; limit?: number }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return listProprietaryApps(db, data);
	});

export const fetchProprietaryAppBySlug = createServerFn({ method: "GET" })
	.inputValidator((input: { slug: string }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return getProprietaryAppBySlug(db, data.slug);
	});

export const fetchProprietaryAppAlternatives = createServerFn({
	method: "GET",
})
	.inputValidator((input: { proprietaryAppId: string }) => input)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle's AppSourceMetadata (Record<string, unknown>) doesn't satisfy TanStack's serialization check
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return getProprietaryAppAlternatives(db, data.proprietaryAppId);
	});

export const fetchTags = createServerFn({ method: "GET" }).handler(async () => {
	const db = getDb();
	return listTags(db);
});

export const fetchTagsByType = createServerFn({ method: "GET" })
	.inputValidator((input: { type: TagType }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return listTagsByType(db, data.type);
	});

export const fetchCategoriesWithApps = createServerFn({
	method: "GET",
}).handler(async () => {
	const db = getDb();
	return listCategoriesWithApps(db);
});

export const fetchSearchResults = createServerFn({ method: "GET" })
	.inputValidator((input: { query: string }) => input)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle's AppSourceMetadata (Record<string, unknown>) doesn't satisfy TanStack's serialization check
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		const client = getTursoClient();

		const [keywordResults, embedding] = await Promise.all([
			searchApps(db, data.query),
			embedText(getAI(), data.query).catch((err) => {
				console.error("Embedding failed:", err);
				return null;
			}),
		]);

		if (!embedding) return keywordResults;

		const vectorResults = await semanticSearch(client, db, embedding);

		// Merge: vector results first, then keyword matches not already present
		const seenAppIds = new Set(vectorResults.apps.map((a) => a.id));
		const seenPropIds = new Set(vectorResults.proprietaryApps.map((p) => p.id));

		const mergedApps = [
			...vectorResults.apps,
			...keywordResults.apps.filter((a) => !seenAppIds.has(a.id)),
		];

		const mergedProps = [
			...vectorResults.proprietaryApps,
			...keywordResults.proprietaryApps.filter((p) => !seenPropIds.has(p.id)),
		];

		return { apps: mergedApps, proprietaryApps: mergedProps };
	});

export const fetchTagBySlug = createServerFn({ method: "GET" })
	.inputValidator((input: { slug: string; type?: TagType }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return getTagBySlug(db, data.slug, data.type);
	});

export const fetchAppsByTag = createServerFn({ method: "GET" })
	.inputValidator(
		(input: { tagSlug: string; page?: number; limit?: number }) => input,
	)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return listAppsByTag(db, data.tagSlug, data);
	});

export const fetchTagsWithCounts = createServerFn({ method: "GET" })
	.inputValidator((input: { type?: TagType }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return listTagsWithCounts(db, data.type);
	});

export const fetchLicenses = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = getDb();
		return listLicenses(db);
	},
);

export const fetchAppsByLicense = createServerFn({ method: "GET" })
	.inputValidator(
		(input: { license: string; page?: number; limit?: number }) => input,
	)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return listAppsByLicense(db, data.license, data);
	});

export const fetchDesktopApps = createServerFn({ method: "GET" })
	.inputValidator(
		(input: { page?: number; limit?: number }) => input,
	)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return listDesktopApps(db, data);
	});

export const fetchRecentApps = createServerFn({ method: "GET" })
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Drizzle's AppSourceMetadata (Record<string, unknown>) doesn't satisfy TanStack's serialization check
	.handler(async (): Promise<any> => {
		const db = getDb();
		return getRecentApps(db);
	});

export const fetchComparisonBySlug = createServerFn({ method: "GET" })
	.inputValidator((input: { slug: string }) => input)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	.handler(async ({ data }): Promise<any> => {
		const db = getDb();
		return getComparisonBySlug(db, data.slug);
	});

export const fetchComparisonPairsForApp = createServerFn({ method: "GET" })
	.inputValidator((input: { appId: string; limit?: number }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return listComparisonPairsForApp(db, data.appId, data.limit);
	});
