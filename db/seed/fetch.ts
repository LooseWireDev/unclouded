import "dotenv/config";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const CACHE_DIR = path.resolve(process.cwd(), ".cache");

const SOURCES = {
	fdroid: {
		url: "https://f-droid.org/repo/index-v2.json",
		file: "fdroid-index.json",
	},
	izzy: {
		url: "https://apt.izzysoft.de/fdroid/repo/index-v2.json",
		file: "izzy-index.json",
	},
	obtainium: {
		repo: "https://github.com/ImranR98/apps.obtainium.imranr.dev.git",
		dir: "obtainium",
	},
} as const;

const fresh = process.argv.includes("--fresh");

async function fetchFile(url: string, destPath: string, label: string) {
	if (!fresh && fs.existsSync(destPath)) {
		const stats = fs.statSync(destPath);
		const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
		console.log(`  [cached] ${label} (${sizeMB} MB)`);
		return;
	}

	console.log(`  [fetch]  ${label} from ${url}...`);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch ${label}: ${response.status} ${response.statusText}`,
		);
	}
	const buffer = Buffer.from(await response.arrayBuffer());
	fs.writeFileSync(destPath, buffer);
	const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
	console.log(`  [done]   ${label} (${sizeMB} MB)`);
}

function fetchGitRepo(repoUrl: string, destDir: string, label: string) {
	if (!fresh && fs.existsSync(path.join(destDir, ".git"))) {
		console.log(`  [cached] ${label} (pulling latest...)`);
		execFileSync("git", ["pull", "--quiet"], { cwd: destDir, stdio: "pipe" });
		return;
	}

	if (fs.existsSync(destDir)) {
		fs.rmSync(destDir, { recursive: true });
	}

	console.log(`  [clone]  ${label}...`);
	execFileSync("git", ["clone", "--depth", "1", "--quiet", repoUrl, destDir], {
		stdio: "pipe",
	});
	console.log(`  [done]   ${label}`);
}

async function main() {
	console.log(`\nSeed data fetch${fresh ? " (--fresh)" : ""}`);
	console.log("─".repeat(50));

	fs.mkdirSync(CACHE_DIR, { recursive: true });

	await fetchFile(
		SOURCES.fdroid.url,
		path.join(CACHE_DIR, SOURCES.fdroid.file),
		"F-Droid index",
	);

	await fetchFile(
		SOURCES.izzy.url,
		path.join(CACHE_DIR, SOURCES.izzy.file),
		"IzzyOnDroid index",
	);

	fetchGitRepo(
		SOURCES.obtainium.repo,
		path.join(CACHE_DIR, SOURCES.obtainium.dir),
		"Obtainium configs",
	);

	console.log("\nAll sources fetched.\n");
}

main().catch((err) => {
	console.error("Fetch failed:", err);
	process.exit(1);
});
