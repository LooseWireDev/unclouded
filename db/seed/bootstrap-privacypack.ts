/**
 * One-time bootstrap: fetch PrivacyPack data and write seed files.
 * Run with: pnpm tsx db/seed/bootstrap-privacypack.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { convertPrivacyPack } from "./parsers/privacypack";

const PRIVACYPACK_URL =
	"https://raw.githubusercontent.com/ente-io/privacypack/main/data/apps.json";

async function main() {
	console.log("Fetching PrivacyPack data...");
	const response = await fetch(PRIVACYPACK_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`);
	}
	const data = await response.json();

	console.log("Converting...");
	const { proprietaryApps, alternativeMappings } = convertPrivacyPack(data);

	console.log(
		`  ${proprietaryApps.length} proprietary apps, ${alternativeMappings.length} alternative mappings`,
	);

	// Write proprietary-apps.ts
	const propFile = path.join(
		import.meta.dirname,
		"data",
		"proprietary-apps.ts",
	);
	const propContent = `import type { ProprietaryAppSeed } from "../lib/types";

/**
 * Curated proprietary apps — the things people replace.
 * Auto-generated from PrivacyPack (https://github.com/ente-io/privacypack)
 * then manually enriched with package names and descriptions.
 */
export const proprietaryApps: ProprietaryAppSeed[] = ${formatArray(proprietaryApps)};
`;
	fs.writeFileSync(propFile, propContent);
	console.log(`  Wrote ${propFile}`);

	// Write alternatives.ts
	const altFile = path.join(import.meta.dirname, "data", "alternatives.ts");
	const altContent = `import type { AlternativeSeed } from "../lib/types";

/**
 * Curated alternative mappings.
 * Auto-generated from PrivacyPack (https://github.com/ente-io/privacypack).
 * Uses appSlug to match alternatives — these resolve against app slugs in the database.
 */
export const alternativeMappings: AlternativeSeed[] = ${formatArray(alternativeMappings)};
`;
	fs.writeFileSync(altFile, altContent);
	console.log(`  Wrote ${altFile}`);

	console.log("\nDone. Now run: pnpm seed:import");
}

function formatArray(arr: unknown[]): string {
	return JSON.stringify(arr, null, "\t").replace(/"([^"]+)":/g, "$1:");
}

main().catch((err) => {
	console.error("Bootstrap failed:", err);
	process.exit(1);
});
