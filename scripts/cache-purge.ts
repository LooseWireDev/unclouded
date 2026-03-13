import "dotenv/config";

const zoneId = process.env.CF_ZONE_ID;
const apiToken = process.env.CF_API_TOKEN;
const kvNamespaceId = process.env.CF_KV_NAMESPACE_ID;

if (!zoneId || !apiToken) {
	console.error("Missing CF_ZONE_ID or CF_API_TOKEN environment variables");
	process.exit(1);
}

// Purge Cloudflare edge cache
const cacheResponse = await fetch(
	`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
	{
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ purge_everything: true }),
	},
);

const cacheResult = await cacheResponse.json();

if (cacheResult.success) {
	console.log("Edge cache purged");
} else {
	console.error("Edge cache purge failed:", cacheResult.errors);
	process.exit(1);
}

// Purge KV namespace
if (!kvNamespaceId) {
	console.log("No CF_KV_NAMESPACE_ID set, skipping KV purge");
} else {
	const accountId = process.env.CF_ACCOUNT_ID;
	if (!accountId) {
		console.error("Missing CF_ACCOUNT_ID for KV purge");
		process.exit(1);
	}

	// List all keys
	let cursor: string | undefined;
	const allKeys: string[] = [];

	do {
		const params = new URLSearchParams();
		if (cursor) params.set("cursor", cursor);

		const listRes = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/keys?${params}`,
			{ headers: { Authorization: `Bearer ${apiToken}` } },
		);

		const listData: any = await listRes.json();
		if (!listData.success) {
			console.error("KV list failed:", listData.errors);
			process.exit(1);
		}

		allKeys.push(...listData.result.map((k: { name: string }) => k.name));
		cursor = listData.result_info?.cursor;
	} while (cursor);

	if (allKeys.length === 0) {
		console.log("KV namespace empty, nothing to purge");
	} else {
		// Bulk delete (max 10,000 per request)
		for (let i = 0; i < allKeys.length; i += 10000) {
			const batch = allKeys.slice(i, i + 10000);
			const delRes = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/bulk`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${apiToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(batch),
				},
			);

			const delData: any = await delRes.json();
			if (!delData.success) {
				console.error("KV bulk delete failed:", delData.errors);
				process.exit(1);
			}
		}

		console.log(`KV purged: ${allKeys.length} keys deleted`);
	}
}
