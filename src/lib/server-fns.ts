import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../../db/client";
import {
	getAppAlternatives,
	getAppBySlug,
	getProprietaryAppAlternatives,
	getProprietaryAppBySlug,
	getRecentApps,
	listApps,
	listProprietaryApps,
	listTags,
	listTagsByType,
	searchApps,
} from "../../db/queries";
import type { TagType } from "../../db/schema";

export const fetchApps = createServerFn({ method: "GET" })
	.inputValidator(
		(input: { tagSlugs?: string[]; page?: number; limit?: number }) => input,
	)
	.handler(async ({ data }) => {
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

export const fetchSearchResults = createServerFn({ method: "GET" })
	.inputValidator((input: { query: string }) => input)
	.handler(async ({ data }) => {
		const db = getDb();
		return searchApps(db, data.query);
	});

export const fetchRecentApps = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = getDb();
		return getRecentApps(db);
	},
);
