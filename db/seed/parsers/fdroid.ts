import type { ParsedApp } from "../lib/types";

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

export function parseFDroidIndex(
	indexJson: FDroidIndex,
	sourceType: FDroidSourceType,
): ParsedApp[] {
	const repoAddress = indexJson.repo?.address || "";
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

		const sourceUrl =
			sourceType === "fdroid"
				? `https://f-droid.org/packages/${packageName}/`
				: `https://apt.izzysoft.de/fdroid/index/apk/${packageName}`;

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
			sources: [{ source: sourceType, url: sourceUrl }],
		});
	}

	return apps;
}
