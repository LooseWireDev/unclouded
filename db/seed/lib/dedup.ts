import type { ParsedApp } from "./types";

export function deduplicateApps(allApps: ParsedApp[]): {
	apps: ParsedApp[];
	stats: { total: number; unique: number; merged: number };
} {
	const byPackage = new Map<string, ParsedApp>();

	for (const app of allApps) {
		const existing = byPackage.get(app.packageName);

		if (!existing) {
			byPackage.set(app.packageName, {
				...app,
				sources: [...app.sources],
				categories: [...(app.categories || [])],
				antiFeatures: [...(app.antiFeatures || [])],
			});
			continue;
		}

		existing.description = existing.description || app.description;
		existing.summary = existing.summary || app.summary;
		existing.iconUrl = existing.iconUrl || app.iconUrl;
		existing.license = existing.license || app.license;
		existing.websiteUrl = existing.websiteUrl || app.websiteUrl;
		existing.repositoryUrl = existing.repositoryUrl || app.repositoryUrl;

		for (const source of app.sources) {
			const hasSameSource = existing.sources.some(
				(s) => s.source === source.source,
			);
			if (!hasSameSource) {
				existing.sources.push(source);
			}
		}

		for (const cat of app.categories || []) {
			if (!existing.categories?.includes(cat)) {
				existing.categories = existing.categories || [];
				existing.categories.push(cat);
			}
		}
		for (const af of app.antiFeatures || []) {
			if (!existing.antiFeatures?.includes(af)) {
				existing.antiFeatures = existing.antiFeatures || [];
				existing.antiFeatures.push(af);
			}
		}
	}

	const unique = Array.from(byPackage.values());
	const merged = allApps.length - unique.length;

	return {
		apps: unique,
		stats: { total: allApps.length, unique: unique.length, merged },
	};
}
