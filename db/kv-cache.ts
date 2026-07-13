import { env, waitUntil } from "cloudflare:workers";

function getKV(): KVNamespace {
	return env.KV;
}

// Default TTL so entries self-expire even if the manual purge script
// isn't run after a reseed. Matches the 1-week edge cache window.
const DEFAULT_TTL = 604800;

// Per-isolate hot cache in front of KV. Every kv.get() counts against
// the 100k/day free-plan read quota — hit or miss — so repeat lookups
// of the same key (nav tags, category lists, sitemap slugs) within an
// isolate's lifetime should never reach KV at all.
const MEM_TTL_MS = 5 * 60 * 1000;
const MEM_MAX_ENTRIES = 256;
const memCache = new Map<string, { value: unknown; expires: number }>();

function memGet(key: string): unknown {
	const entry = memCache.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expires) {
		memCache.delete(key);
		return undefined;
	}
	return entry.value;
}

function memSet(key: string, value: unknown): void {
	if (memCache.size >= MEM_MAX_ENTRIES) {
		// Map iterates in insertion order, so the first key is the oldest
		const oldest = memCache.keys().next().value;
		if (oldest !== undefined) memCache.delete(oldest);
	}
	memCache.set(key, { value, expires: Date.now() + MEM_TTL_MS });
}

export async function kvCached<T>(
	key: string,
	fn: () => Promise<T>,
	opts?: { ttl?: number },
): Promise<T> {
	const hot = memGet(key);
	if (hot !== undefined) return hot as T;

	const kv = getKV();
	// KV throws once the daily free-plan quota is exhausted — fall
	// through to the database instead of failing the page.
	let cached: T | null = null;
	try {
		cached = await kv.get(key, "json");
	} catch {}
	if (cached !== null) {
		memSet(key, cached);
		return cached;
	}

	const result = await fn();
	// Null/undefined reads back as a cache miss, so storing it only
	// burns a KV write on every lookup of a nonexistent slug.
	if (result != null) {
		memSet(key, result);
		// A bare floating promise is cancelled when the request context
		// ends, so the write must be kept alive via waitUntil to ever land.
		// Log failures — a silently broken write path leaves every request
		// paying for a cache that never fills.
		waitUntil(
			kv
				.put(key, JSON.stringify(result), {
					expirationTtl: opts?.ttl ?? DEFAULT_TTL,
				})
				.catch((err) => {
					console.error(`KV put failed for ${key}:`, err);
				}),
		);
	}
	return result;
}

export function cacheKey(
	name: string,
	params?: Record<string, unknown>,
): string {
	if (!params || Object.keys(params).length === 0) return name;
	const sorted = Object.entries(params)
		.filter(([, v]) => v !== undefined)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(",") : v}`)
		.join(":");
	return `${name}:${sorted}`;
}
