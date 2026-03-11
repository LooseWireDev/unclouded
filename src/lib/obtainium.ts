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
	obtainium: 0,
	github: 1,
	fdroid: 2,
	izzyondroid: 3,
	direct: 4,
};

const SOURCE_LABELS: Record<string, string> = {
	github: "via GitHub",
	fdroid: "via F-Droid",
	izzyondroid: "via IzzyOnDroid",
	obtainium: "via Obtainium",
	direct: "Direct download",
};

/**
 * Generate a single Obtainium deep link for one source.
 * Returns null if the source type is unsupported (e.g. play_store).
 */
export function generateObtainiumLink(
	appName: string,
	source: SourceInfo,
): string | null {
	switch (source.source) {
		case "github":
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

		case "obtainium": {
			const meta = source.metadata as {
				apkFilterRegex?: string;
				additionalSettings?: Record<string, unknown>;
			} | null;
			if (meta?.apkFilterRegex || meta?.additionalSettings) {
				const config = {
					url: source.url,
					name: appName,
					additionalSettings: JSON.stringify({
						...(meta.additionalSettings ?? {}),
						...(meta.apkFilterRegex
							? { apkFilterRegEx: meta.apkFilterRegex }
							: {}),
					}),
				};
				return `obtainium://app/${encodeURIComponent(JSON.stringify(config))}`;
			}
			return `obtainium://add/${source.url}`;
		}

		case "direct":
			return `obtainium://add/${source.url}`;

		default:
			return null;
	}
}

/**
 * Given all sources for an app, return a ranked list of compatible sources
 * with Obtainium deep links.
 * Priority: obtainium > github > fdroid > izzyondroid > direct
 */
export function getObtainiumSources(
	appName: string,
	sources: SourceInfo[],
): ObtainiumSource[] {
	const results: ObtainiumSource[] = [];

	for (const source of sources) {
		const link = generateObtainiumLink(appName, source);
		if (!link) continue;

		results.push({
			source: source.source,
			label: SOURCE_LABELS[source.source] ?? source.source,
			link,
		});
	}

	return results.sort(
		(a, b) =>
			(SOURCE_PRIORITY[a.source] ?? 99) - (SOURCE_PRIORITY[b.source] ?? 99),
	);
}

function extractPackageFromUrl(url: string): string | null {
	// Match patterns like /packages/org.example.app or /apk/org.example.app
	const match = url.match(/(?:packages|apk)\/([\w.]+)/);
	return match?.[1] ?? null;
}
