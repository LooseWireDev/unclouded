import { env } from "cloudflare:workers";

function getKV(): KVNamespace {
	return env.KV;
}

export async function kvCached<T>(
	key: string,
	fn: () => Promise<T>,
): Promise<T> {
	const kv = getKV();
	const cached = await kv.get(key, "json");
	if (cached !== null) return cached as T;

	const result = await fn();
	// Fire-and-forget write — don't block the response
	kv.put(key, JSON.stringify(result)).catch(() => {});
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
