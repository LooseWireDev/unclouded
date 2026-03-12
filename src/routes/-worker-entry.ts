import {
	createStartHandler,
	defaultStreamHandler,
} from "@tanstack/react-start/server";
import { getDb } from "../../db/client";
import {
	listAllAppSlugs,
	listAllComparisonSlugs,
	listAllProprietaryAppSlugs,
	listAllTagSlugs,
	listLicenses,
} from "../../db/queries";

const tanstackFetch = createStartHandler(defaultStreamHandler);

const SITE_URL = "https://unclouded.app";

// ─── Cache Control Rules ────────────────────────────────────────────

type CacheRule = { pattern: RegExp; header: string };

const cacheRules: CacheRule[] = [
	{ pattern: /^\/search/, header: "no-store" },
	{
		pattern: /^\/sitemap.*\.xml$|^\/robots\.txt$/,
		header: "public, s-maxage=86400",
	},
	{
		pattern: /^\/compare\//,
		header: "public, s-maxage=86400, stale-while-revalidate=604800",
	},
	{
		pattern: /^\/(apps|alternatives)\/[^/]+$|^\/(category|tags|license)\//,
		header: "public, s-maxage=3600, stale-while-revalidate=86400",
	},
	{
		pattern: /^\/(apps|alternatives|discover)?$/,
		header: "public, s-maxage=600, stale-while-revalidate=3600",
	},
];

function getCacheHeader(pathname: string): string | null {
	for (const rule of cacheRules) {
		if (rule.pattern.test(pathname)) return rule.header;
	}
	return null;
}

// ─── robots.txt ─────────────────────────────────────────────────────

function robotsTxt(): Response {
	const body = `User-agent: *
Allow: /
Disallow: /search

Sitemap: ${SITE_URL}/sitemap.xml
`;
	return new Response(body, {
		headers: {
			"Content-Type": "text/plain",
			"Cache-Control": "public, s-maxage=86400",
		},
	});
}

// ─── XML Sitemap Helpers ────────────────────────────────────────────

function xmlResponse(body: string): Response {
	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, s-maxage=86400",
		},
	});
}

function sitemapIndex(sitemaps: string[]): string {
	const entries = sitemaps
		.map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

function urlset(
	urls: { loc: string; priority?: string; changefreq?: string }[],
): string {
	const entries = urls
		.map(
			(u) =>
				`  <url><loc>${u.loc}</loc>${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}${u.priority ? `<priority>${u.priority}</priority>` : ""}</url>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// ─── Sitemap Handlers ───────────────────────────────────────────────

async function sitemapXml(): Promise<Response> {
	const sitemaps = [
		`${SITE_URL}/sitemap-pages.xml`,
		`${SITE_URL}/sitemap-apps.xml`,
		`${SITE_URL}/sitemap-alternatives.xml`,
		`${SITE_URL}/sitemap-categories.xml`,
		`${SITE_URL}/sitemap-tags.xml`,
		`${SITE_URL}/sitemap-comparisons.xml`,
		`${SITE_URL}/sitemap-licenses.xml`,
	];
	return xmlResponse(sitemapIndex(sitemaps));
}

function sitemapPages(): Response {
	return xmlResponse(
		urlset([
			{ loc: SITE_URL, priority: "1.0", changefreq: "daily" },
			{ loc: `${SITE_URL}/apps`, priority: "0.9", changefreq: "daily" },
			{ loc: `${SITE_URL}/alternatives`, priority: "0.9", changefreq: "daily" },
			{ loc: `${SITE_URL}/discover`, priority: "0.7", changefreq: "daily" },
		]),
	);
}

async function sitemapApps(): Promise<Response> {
	const db = getDb();
	const slugs = await listAllAppSlugs(db);
	return xmlResponse(
		urlset(
			slugs.map((s) => ({
				loc: `${SITE_URL}/apps/${s.slug}`,
				changefreq: "weekly",
				priority: "0.7",
			})),
		),
	);
}

async function sitemapAlternatives(): Promise<Response> {
	const db = getDb();
	const slugs = await listAllProprietaryAppSlugs(db);
	return xmlResponse(
		urlset(
			slugs.map((s) => ({
				loc: `${SITE_URL}/alternatives/${s.slug}`,
				changefreq: "weekly",
				priority: "0.8",
			})),
		),
	);
}

async function sitemapCategories(): Promise<Response> {
	const db = getDb();
	const slugs = await listAllTagSlugs(db, "category");
	return xmlResponse(
		urlset(
			slugs.map((s) => ({
				loc: `${SITE_URL}/category/${s.slug}`,
				changefreq: "weekly",
				priority: "0.8",
			})),
		),
	);
}

async function sitemapTags(): Promise<Response> {
	const db = getDb();
	const slugs = await listAllTagSlugs(db);
	const nonCategory = slugs.filter((s: { slug: string; type: string }) => s.type !== "category");
	return xmlResponse(
		urlset(
			nonCategory.map((s) => ({
				loc: `${SITE_URL}/tags/${s.type}/${s.slug}`,
				changefreq: "weekly",
				priority: "0.6",
			})),
		),
	);
}

async function sitemapComparisons(): Promise<Response> {
	const db = getDb();
	const slugs = await listAllComparisonSlugs(db);
	return xmlResponse(
		urlset(
			slugs.map((s) => ({
				loc: `${SITE_URL}/compare/${s.slug}`,
				changefreq: "monthly",
				priority: "0.5",
			})),
		),
	);
}

async function sitemapLicenses(): Promise<Response> {
	const db = getDb();
	const licenses = await listLicenses(db);
	return xmlResponse(
		urlset(
			licenses
				.filter((l: { license: string | null }) => l.license)
				.map((l: { license: string | null }) => ({
					loc: `${SITE_URL}/license/${encodeURIComponent(l.license!)}`,
					changefreq: "weekly",
					priority: "0.6",
				})),
		),
	);
}

const sitemapHandlers: Record<string, () => Response | Promise<Response>> = {
	"/sitemap.xml": sitemapXml,
	"/sitemap-pages.xml": sitemapPages,
	"/sitemap-apps.xml": sitemapApps,
	"/sitemap-alternatives.xml": sitemapAlternatives,
	"/sitemap-categories.xml": sitemapCategories,
	"/sitemap-tags.xml": sitemapTags,
	"/sitemap-comparisons.xml": sitemapComparisons,
	"/sitemap-licenses.xml": sitemapLicenses,
};

// ─── Worker Entry ───────────────────────────────────────────────────

export default {
	async fetch(request: Request, _env: Env): Promise<Response> {

		const url = new URL(request.url);
		const { pathname } = url;

		// robots.txt
		if (pathname === "/robots.txt") {
			return robotsTxt();
		}

		// Sitemaps
		const sitemapHandler = sitemapHandlers[pathname];
		if (sitemapHandler) {
			return sitemapHandler();
		}

		// Pass through to TanStack Start
		const response = await tanstackFetch(request);

		// Apply cache headers
		const cacheHeader = getCacheHeader(pathname);
		if (cacheHeader && response.status === 200) {
			const newResponse = new Response(response.body, response);
			newResponse.headers.set("Cache-Control", cacheHeader);
			return newResponse;
		}

		return response;
	},
};
