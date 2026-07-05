import type { ThirdPartyFdroidRepo } from "../data/fdroid-repos";
import type { ParsedApp, ParsedAppSource } from "../lib/types";

type FDroidIndex = {
	repo: { address: string };
	packages: Record<string, FDroidPackage>;
};

type FDroidPackage = {
	metadata: {
		name?: Record<string, string>;
		summary?: Record<string, string>;
		description?: Record<string, string>;
		categories?: string[];
		antiFeatures?: Record<string, Record<string, unknown>> | string[];
		license?: string;
		sourceCode?: string;
		webSite?: string;
		icon?: Record<string, { name: string }>;
		added?: number;
		lastUpdated?: number;
	};
	versions?: Record<string, unknown>;
};

function localized(field?: Record<string, string>): string | undefined {
	if (!field) return undefined;
	return field["en-US"] || field.en || Object.values(field)[0] || undefined;
}

function extractAntiFeatures(
	af?: Record<string, Record<string, unknown>> | string[],
): string[] {
	if (!af) return [];
	if (Array.isArray(af)) return af;
	return Object.keys(af);
}

export type FDroidSourceType = "fdroid" | "izzyondroid";

/**
 * Parse any F-Droid-format index-v2 file. Pass "fdroid"/"izzyondroid" for
 * the two main repos (which have per-app web pages), or a
 * ThirdPartyFdroidRepo entry for a developer-run repo — those get the
 * repo's human-facing page as the source URL plus a full Obtainium
 * FDroidRepo config so install deep links work.
 */
export function parseFDroidIndex(
	indexJson: FDroidIndex,
	sourceType: FDroidSourceType | ThirdPartyFdroidRepo,
): ParsedApp[] {
	const repo = typeof sourceType === "string" ? undefined : sourceType;
	const repoAddress = indexJson.repo?.address || repo?.repoUrl || "";
	const apps: ParsedApp[] = [];

	for (const [packageName, pkg] of Object.entries(indexJson.packages)) {
		const meta = pkg.metadata;
		if (!meta) continue;

		const name = localized(meta.name);
		if (!name) continue;

		let iconUrl: string | undefined;
		const iconPath =
			meta.icon?.["en-US"]?.name || Object.values(meta.icon || {})[0]?.name;
		if (iconPath && repoAddress) {
			iconUrl = `${repoAddress}${iconPath}`;
		}

		let source: ParsedAppSource;
		if (repo) {
			source = {
				source: repo.source,
				url: repo.webUrl,
				metadata: {
					obtainiumConfig: {
						id: packageName,
						url: repoAddress,
						name,
						author: repo.name,
						additionalSettings: JSON.stringify({ appIdOrName: packageName }),
						overrideSource: "FDroidRepo",
					},
				},
			};
		} else {
			source = {
				source: sourceType as FDroidSourceType,
				url:
					sourceType === "fdroid"
						? `https://f-droid.org/packages/${packageName}/`
						: `https://apt.izzysoft.de/fdroid/index/apk/${packageName}`,
			};
		}

		apps.push({
			packageName,
			name,
			description: localized(meta.description),
			summary: localized(meta.summary),
			iconUrl,
			license: meta.license,
			websiteUrl: meta.webSite || undefined,
			repositoryUrl: meta.sourceCode || undefined,
			categories: meta.categories || [],
			antiFeatures: extractAntiFeatures(meta.antiFeatures),
			sources: [source],
		});
	}

	return apps;
}
