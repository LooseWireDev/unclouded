import { env } from "cloudflare:workers";

function getKV(): KVNamespace {
	return env.KV;
}

// Default TTL so entries self-expire even if the manual purge script
// isn't run after a reseed. Matches the 1-week edge cache window.
const DEFAULT_TTL = 604800;

export async function kvCached<T>(
	key: string,
	fn: () => Promise<T>,
	opts?: { ttl?: number },
): Promise<T> {
	const kv = getKV();
	const cached = await kv.get(key, "json");
	if (cached !== null) return cached as T;

	const result = await fn();
	// Null/undefined reads back as a cache miss, so storing it only
	// burns a KV write on every lookup of a nonexistent slug.
	if (result != null) {
		// Fire-and-forget write — don't block the response
		kv.put(key, JSON.stringify(result), {
			expirationTtl: opts?.ttl ?? DEFAULT_TTL,
		}).catch(() => {});
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
