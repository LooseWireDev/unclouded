import "dotenv/config";

const zoneId = process.env.CF_ZONE_ID;
const apiToken = process.env.CF_API_TOKEN;

if (!zoneId || !apiToken) {
	console.error("Missing CF_ZONE_ID or CF_API_TOKEN environment variables");
	process.exit(1);
}

const response = await fetch(
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

const result = await response.json();

if (result.success) {
	console.log("Cache purged successfully");
} else {
	console.error("Cache purge failed:", result.errors);
	process.exit(1);
}
