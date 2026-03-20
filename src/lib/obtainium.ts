export type SourceInfo = {
	source: string;
	url: string;
	packageName?: string | null;
	metadata?: Record<string, unknown> | null;
};

type ObtainiumSource = {
	source: string;
	label: string;
	link: string;
};

const SOURCE_PRIORITY: Record<string, number> = {
	github: 0,
	gitlab: 1,
	codeberg: 2,
	fdroid: 3,
	izzyondroid: 4,
	sourceforge: 5,
	direct: 6,
};

const SOURCE_LABELS: Record<string, string> = {
	github: "via GitHub",
	gitlab: "via GitLab",
	codeberg: "via Codeberg",
	fdroid: "via F-Droid",
	izzyondroid: "via IzzyOnDroid",
	sourceforge: "via SourceForge",
	direct: "Direct download",
};

/**
 * Generate a single Obtainium deep link for one source.
 * If the source has a stored Obtainium config (from the Obtainium community repo),
 * use the full config to generate a proper obtainium://app/ link.
 * Otherwise, generate a simple obtainium://add/ link from the URL.
 */
export function generateObtainiumLink(source: SourceInfo): string | null {
	const meta = source.metadata as {
		obtainiumConfig?: Record<string, unknown>;
		apkFilterRegex?: string;
	} | null;

	// If we have a full Obtainium config, use it for a proper deep link
	if (meta?.obtainiumConfig) {
		const raw = meta.obtainiumConfig;
		// Obtainium's App.fromJson requires id, url, author, name as non-null
		// Strings, and additionalSettings as a JSON string. Ensure defaults
		// for any configs stored before these were included.
		const config: Record<string, unknown> = {
			id: raw.id ?? source.packageName ?? "",
			url: raw.url ?? source.url,
			author: raw.author ?? "",
			name: raw.name ?? "",
			preferredApkIndex: raw.preferredApkIndex ?? 0,
			additionalSettings: raw.additionalSettings ?? "{}",
		};
		if (raw.overrideSource != null) {
			config.overrideSource = raw.overrideSource;
		}
		return `obtainium://app/${encodeURIComponent(JSON.stringify(config))}`;
	}

	// Otherwise generate a simple add link based on source type
	switch (source.source) {
		case "github":
		case "gitlab":
		case "codeberg":
		case "direct":
		case "sourceforge":
			return `obtainium://add/${source.url}`;

		case "fdroid": {
			const pkg = source.packageName ?? extractPackageFromUrl(source.url);
			if (!pkg) return null;
			return `obtainium://add/https://f-droid.org/packages/${pkg}`;
		}

		case "izzyondroid": {
			const pkg = source.packageName ?? extractPackageFromUrl(source.url);
			if (!pkg) return null;
			return `obtainium://add/https://apt.izzysoft.de/fdroid/index/apk/${pkg}`;
		}

		default:
			return null;
	}
}

/**
 * Given all sources for an app, return a ranked list of compatible sources
 * with Obtainium deep links.
 * Sources with a stored Obtainium config are prioritized first.
 */
export function getObtainiumSources(sources: SourceInfo[]): ObtainiumSource[] {
	const results: ObtainiumSource[] = [];

	for (const source of sources) {
		const link = generateObtainiumLink(source);
		if (!link) continue;

		const meta = source.metadata as {
			obtainiumConfig?: Record<string, unknown>;
		} | null;

		results.push({
			source: source.source,
			label: meta?.obtainiumConfig
				? "Obtainium config"
				: (SOURCE_LABELS[source.source] ?? source.source),
			link,
		});
	}

	// Sources with obtainiumConfig get top priority, then by source type
	return results.sort((a, b) => {
		const aHasConfig = a.label === "Obtainium config" ? 0 : 1;
		const bHasConfig = b.label === "Obtainium config" ? 0 : 1;
		if (aHasConfig !== bHasConfig) return aHasConfig - bHasConfig;
		return (
			(SOURCE_PRIORITY[a.source] ?? 99) - (SOURCE_PRIORITY[b.source] ?? 99)
		);
	});
}

function extractPackageFromUrl(url: string): string | null {
	const match = url.match(/(?:packages|apk)\/([\w.]+)/);
	return match?.[1] ?? null;
}
