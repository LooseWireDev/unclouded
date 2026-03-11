import { slugify } from "../lib/slugify";
import type { AlternativeSeed, ProprietaryAppSeed } from "../lib/types";

type PrivacyPackData = {
	categories: Array<{
		name: string;
		order: number;
		mainstream_apps: Array<{ id: string; name: string }>;
		private_alternatives: Array<{ id: string; name: string }>;
	}>;
};

const categoryTagMap: Record<string, string> = {
	Mail: "email",
	Photos: "gallery",
	Search: "search",
	Browser: "browser",
	Messaging: "messaging",
	Notes: "notes",
	Drive: "cloud-storage",
	Passwords: "password-manager",
	"2FA": "2fa",
	Calendar: "calendar",
	"App Store": "app-store",
	VPN: "vpn",
	"AI Assistant": "ai-assistant",
	"Smart Home": "smart-home",
	Maps: "maps",
	Translator: "translator",
	Community: "social",
	DNS: "productivity",
	"Computer OS": "os",
	"Phone OS": "os",
	Entertainment: "video",
	"API Testing": "dev-tools",
};

export function convertPrivacyPack(data: PrivacyPackData): {
	proprietaryApps: ProprietaryAppSeed[];
	alternativeMappings: AlternativeSeed[];
} {
	const proprietaryApps: ProprietaryAppSeed[] = [];
	const alternativeMappings: AlternativeSeed[] = [];
	const seenSlugs = new Set<string>();

	for (const category of data.categories) {
		const tagSlug = categoryTagMap[category.name];
		const categoryTags = tagSlug ? [tagSlug] : [];

		for (const mainstream of category.mainstream_apps) {
			const slug = slugify(mainstream.name);
			if (seenSlugs.has(slug)) continue;
			seenSlugs.add(slug);

			proprietaryApps.push({
				name: mainstream.name,
				slug,
				tags: categoryTags,
			});

			for (const alt of category.private_alternatives) {
				alternativeMappings.push({
					proprietarySlug: slug,
					appSlug: slugify(alt.name),
					relationshipType: "direct",
				});
			}
		}
	}

	return { proprietaryApps, alternativeMappings };
}
