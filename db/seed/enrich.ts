import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../schema";
import { appSources, apps } from "../schema";
import { fuzzyMatch } from "./lib/matcher";
import type { ParsedApp } from "./lib/types";
import { parseFDroidIndex } from "./parsers/fdroid";

const CACHE_DIR = path.resolve(process.cwd(), ".cache");

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client, { schema });

async function main() {
	console.log("\nSeed enrichment");
	console.log("═".repeat(50));

	const candidates: ParsedApp[] = [];

	const fdroidPath = path.join(CACHE_DIR, "fdroid-index.json");
	if (fs.existsSync(fdroidPath)) {
		const index = JSON.parse(fs.readFileSync(fdroidPath, "utf-8"));
		candidates.push(...parseFDroidIndex(index, "fdroid"));
	}

	const izzyPath = path.join(CACHE_DIR, "izzy-index.json");
	if (fs.existsSync(izzyPath)) {
		const index = JSON.parse(fs.readFileSync(izzyPath, "utf-8"));
		candidates.push(...parseFDroidIndex(index, "izzyondroid"));
	}

	if (!candidates.length) {
		console.log("No candidate data found. Run seed:fetch first.");
		client.close();
		return;
	}

	console.log(`Loaded ${candidates.length} candidates from indexes`);

	const allApps = await db.select().from(apps);
	const allSources = await db.select().from(appSources);
	const appsWithSources = new Set(allSources.map((s) => s.appId));
	const appsWithoutSources = allApps.filter((a) => !appsWithSources.has(a.id));

	if (!appsWithoutSources.length) {
		console.log("All apps have sources. Nothing to enrich.");
		client.close();
		return;
	}

	console.log(`\nFound ${appsWithoutSources.length} apps without sources:\n`);

	let autoApplied = 0;
	const manualReview: Array<{
		appName: string;
		matches: Array<{
			name: string;
			packageName: string;
			confidence: number;
		}>;
	}> = [];

	for (const app of appsWithoutSources) {
		const matches = fuzzyMatch(app.name, candidates, 3);

		if (!matches.length) {
			console.log(`  [no match] ${app.name}`);
			continue;
		}

		const topMatch = matches[0];

		if (topMatch.confidence >= 90) {
			console.log(
				`  [auto]     ${app.name} → ${topMatch.packageName} (${topMatch.confidence}%)`,
			);
			autoApplied++;
		} else {
			console.log(
				`  [review]   ${app.name} → ${topMatch.name} (${topMatch.confidence}%)`,
			);
			manualReview.push({ appName: app.name, matches });
		}
	}

	console.log(`\n${"─".repeat(50)}`);
	console.log(`Auto-applied: ${autoApplied}`);
	console.log(`Needs review: ${manualReview.length}`);

	if (manualReview.length > 0) {
		console.log("\nManual review needed:");
		for (const item of manualReview) {
			console.log(`\n  ${item.appName}:`);
			for (const match of item.matches) {
				console.log(
					`    - ${match.name} (${match.packageName}) — ${match.confidence}%`,
				);
			}
		}
	}

	console.log();
	client.close();
}

main().catch((err) => {
	console.error("Enrich failed:", err);
	client.close();
	process.exit(1);
});
