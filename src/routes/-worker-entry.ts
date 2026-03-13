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

// Data only changes on manual DB writes (seed/enrich), then cache:purge.
// Cache everything aggressively — 1 week fresh, 1 week stale fallback.
const ONE_WEEK = 604800;

const cacheRules: CacheRule[] = [
	{ pattern: /^\/search/, header: "no-store" },
	{
		pattern: /^\/sitemap.*\.xml$|^\/robots\.txt$/,
		header: `public, s-maxage=${ONE_WEEK}`,
	},
	{
		pattern: /^\/compare\//,
		header: `public, s-maxage=${ONE_WEEK}, stale-while-revalidate=${ONE_WEEK}`,
	},
	{
		pattern: /^\/(apps|alternatives)\/[^/]+$|^\/(category|tags|license)\//,
		header: `public, s-maxage=${ONE_WEEK}, stale-while-revalidate=${ONE_WEEK}`,
	},
	{
		pattern: /^\/(apps|alternatives|discover|desktop)?$/,
		header: `public, s-maxage=${ONE_WEEK}, stale-while-revalidate=${ONE_WEEK}`,
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
Crawl-delay: 10

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
	const nonCategory = slugs.filter(
		(s: { slug: string; type: string }) => s.type !== "category",
	);
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

// ─── Icon Proxy ─────────────────────────────────────────────────────

const ALLOWED_ICON_HOSTS = [
	"f-droid.org",
	"guardianproject.info",
	"apt.izzysoft.de",
	"github.com",
	"raw.githubusercontent.com",
	"gitlab.com",
	"codeberg.org",
	"avatars.githubusercontent.com",
];

const ICON_CACHE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function isAllowedIconHost(hostname: string): boolean {
	return ALLOWED_ICON_HOSTS.some(
		(allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
	);
}

async function handleIconProxy(request: Request): Promise<Response> {
	const requestUrl = new URL(request.url);
	const iconParam = requestUrl.searchParams.get("url");

	if (!iconParam) {
		return new Response("Missing url parameter", { status: 400 });
	}

	let parsed: URL;
	try {
		parsed = new URL(iconParam);
	} catch {
		return new Response("Invalid url", { status: 400 });
	}

	if (!isAllowedIconHost(parsed.hostname)) {
		return new Response("Domain not allowed", { status: 403 });
	}

	// Use the full request URL as cache key
	const cache = (caches as unknown as { default: Cache }).default;
	const cacheKey = new Request(request.url, { method: "GET" });

	const cached = await cache.match(cacheKey);
	if (cached) return cached;

	try {
		const origin = await fetch(iconParam, {
			headers: { "User-Agent": "unclouded-icon-proxy/1.0" },
		});

		if (!origin.ok) {
			return new Response(null, { status: 404 });
		}

		const contentType = origin.headers.get("Content-Type") ?? "";
		if (!contentType.startsWith("image/")) {
			return new Response(null, { status: 404 });
		}

		const response = new Response(origin.body, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": `public, s-maxage=${ICON_CACHE_SECONDS}, max-age=${ICON_CACHE_SECONDS}`,
			},
		});

		// Store in edge cache (fire-and-forget)
		cache.put(cacheKey, response.clone()).catch(() => {});

		return response;
	} catch {
		return new Response(null, { status: 502 });
	}
}

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

		// Icon proxy
		if (pathname === "/icon") {
			return handleIconProxy(request);
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
