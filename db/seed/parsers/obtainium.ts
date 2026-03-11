import * as fs from "node:fs";
import * as path from "node:path";
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
	}>;
	icon?: string;
	categories?: string[];
	description?: Record<string, string>;
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

			const source: ParsedAppSource = {
				source: "obtainium",
				url: primary.url,
				metadata: {
					apkFilterRegex: settings?.apkFilterRegEx || undefined,
					additionalSettings: settings
						? Object.fromEntries(
								Object.entries(settings).filter(
									([k]) =>
										![
											"apkFilterRegEx",
											"appName",
											"appAuthor",
											"about",
										].includes(k),
								),
							)
						: undefined,
				},
			};

			if (
				source.metadata &&
				!source.metadata.apkFilterRegex &&
				!source.metadata.additionalSettings
			) {
				source.metadata = undefined;
			}

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
