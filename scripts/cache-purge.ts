import { execSync } from "node:child_process";
import { writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KV_NAMESPACE_ID = "47a12e13810f43f0b110ac082b60e133";

const args = process.argv.slice(2);
const purgeAll = args.includes("--all");
const keyArgs = args.filter((a) => !a.startsWith("--"));

if (!purgeAll && keyArgs.length === 0) {
	console.log("Usage:");
	console.log("  pnpm cache:purge <key> [key...]   Purge specific KV keys");
	console.log("  pnpm cache:purge --all             Purge all KV keys");
	console.log("");
	console.log("Examples:");
	console.log("  pnpm cache:purge getPopularApps getRecentApps");
	console.log("  pnpm cache:purge --all");
	process.exit(0);
}

if (keyArgs.length > 0) {
	for (const key of keyArgs) {
		console.log(`Deleting key: ${key}`);
		execSync(
			`npx wrangler kv key delete "${key}" --namespace-id=${KV_NAMESPACE_ID} --remote`,
			{ stdio: "inherit" },
		);
	}
	console.log(`Purged ${keyArgs.length} key(s)`);
} else {
	const listFile = join(tmpdir(), "kv-keys-list.json");
	const deleteFile = join(tmpdir(), "kv-keys-to-delete.json");

	console.log("Listing remote KV keys...");
	execSync(
		`npx wrangler kv key list --namespace-id=${KV_NAMESPACE_ID} --remote > "${listFile}"`,
		{ stdio: ["pipe", "pipe", "pipe"] },
	);

	const keys: { name: string }[] = JSON.parse(
		readFileSync(listFile, "utf-8"),
	);
	unlinkSync(listFile);

	if (keys.length === 0) {
		console.log("KV namespace empty, nothing to purge");
	} else {
		writeFileSync(deleteFile, JSON.stringify(keys.map((k) => k.name)));
		try {
			execSync(
				`npx wrangler kv bulk delete "${deleteFile}" --namespace-id=${KV_NAMESPACE_ID} --remote --force`,
				{ stdio: "inherit" },
			);
			console.log(`KV purged: ${keys.length} keys deleted`);
		} finally {
			try {
				unlinkSync(deleteFile);
			} catch {}
		}
	}
}
