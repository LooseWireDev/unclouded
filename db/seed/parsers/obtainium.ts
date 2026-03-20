import * as fs from "node:fs";
import * as path from "node:path";
import type { SourceType } from "../../schema";
import type { ParsedApp, ParsedAppSource } from "../lib/types";

type ObtainiumConfig = {
	configs: Array<{
		id: string;
		url: string;
		author?: string;
		name: string;
		preferredApkIndex?: number;
		additionalSettings?: string;
		overrideSource?: string | null;
		altLabel?: string;
	}>;
	icon?: string;
	categories?: string[];
	description?: Record<string, string | null>;
};

type ObtainiumAdditionalSettings = {
	apkFilterRegEx?: string;
	appName?: string;
	appAuthor?: string;
	about?: string;
	[key: string]: unknown;
};

function parseAdditionalSettings(
	raw?: string,
): ObtainiumAdditionalSettings | undefined {
	if (!raw) return undefined;
	try {
		return JSON.parse(raw);
	} catch {
		return undefined;
	}
}

/**
 * Determine the real source type from a URL.
 * Obtainium is a delivery mechanism, not a source — the actual source
 * is wherever the APK comes from (GitHub, GitLab, Codeberg, etc.).
 */
function resolveSourceType(url: string): SourceType {
	try {
		const hostname = new URL(url).hostname.toLowerCase();

		if (hostname === "github.com" || hostname === "raw.githubusercontent.com")
			return "github";
		if (hostname === "gitlab.com" || hostname.startsWith("gitlab."))
			return "gitlab";
		if (hostname === "codeberg.org") return "codeberg";
		if (hostname === "sourceforge.net" || hostname.endsWith(".sourceforge.net"))
			return "sourceforge";
		if (hostname === "f-droid.org" || hostname.endsWith(".f-droid.org"))
			return "fdroid";
		if (hostname === "git.sr.ht") return "direct";

		return "direct";
	} catch {
		return "direct";
	}
}

export function parseObtainiumConfigs(cacheDir: string): ParsedApp[] {
	const appsDir = path.join(cacheDir, "data", "apps");
	if (!fs.existsSync(appsDir)) {
		console.warn(`Obtainium apps directory not found: ${appsDir}`);
		return [];
	}

	const apps: ParsedApp[] = [];
	const files = fs.readdirSync(appsDir).filter((f) => f.endsWith(".json"));

	for (const file of files) {
		try {
			const raw = fs.readFileSync(path.join(appsDir, file), "utf-8");
			const config: ObtainiumConfig = JSON.parse(raw);

			if (!config.configs?.length) continue;

			const primary = config.configs[0];
			const settings = parseAdditionalSettings(primary.additionalSettings);
			const sourceType = resolveSourceType(primary.url);

			// Build the full Obtainium config object that can be used to generate
			// a working obtainium://app/ deep link.
			// Obtainium's App.fromJson casts id, url, author, name as String
			// (non-nullable), so all four must always be present.
			const obtainiumConfig: Record<string, unknown> = {
				id: primary.id,
				url: primary.url,
				author: primary.author ?? "",
				name: primary.name,
				preferredApkIndex: primary.preferredApkIndex ?? 0,
				additionalSettings: primary.additionalSettings ?? "{}",
			};
			if (primary.overrideSource != null)
				obtainiumConfig.overrideSource = primary.overrideSource;

			const source: ParsedAppSource = {
				source: sourceType,
				url: primary.url,
				metadata: {
					apkFilterRegex: settings?.apkFilterRegEx || undefined,
					obtainiumConfig,
				},
			};

			apps.push({
				packageName: primary.id,
				name: primary.name || settings?.appName || file.replace(".json", ""),
				description:
					config.description?.en ||
					config.description?.["en-US"] ||
					settings?.about ||
					undefined,
				iconUrl: config.icon || undefined,
				categories: config.categories || [],
				antiFeatures: [],
				sources: [source],
			});
		} catch (err) {
			console.warn(`Failed to parse Obtainium config ${file}:`, err);
		}
	}

	return apps;
}
