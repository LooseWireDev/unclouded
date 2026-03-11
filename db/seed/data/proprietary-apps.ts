import type { ProprietaryAppSeed } from "../lib/types";

/**
 * Curated proprietary apps — the things people replace.
 * Assembled from PrivacyPack, Reddit research, and manual curation.
 */
export const proprietaryApps: ProprietaryAppSeed[] = [
	{
		name: "WhatsApp",
		slug: "whatsapp",
		packageName: "com.whatsapp",
		description: "Meta-owned messaging app with end-to-end encryption",
		websiteUrl: "https://whatsapp.com",
		tags: ["messaging", "android", "ios"],
	},
	{
		name: "Facebook Messenger",
		slug: "facebook-messenger",
		packageName: "com.facebook.orca",
		description: "Meta-owned messaging platform",
		websiteUrl: "https://messenger.com",
		tags: ["messaging", "android", "ios"],
	},
	{
		name: "Chrome",
		slug: "chrome",
		packageName: "com.android.chrome",
		description: "Google's web browser with extensive tracking",
		websiteUrl: "https://chrome.google.com",
		tags: ["browser", "android", "ios", "desktop"],
	},
	{
		name: "Google Maps",
		slug: "google-maps",
		packageName: "com.google.android.apps.maps",
		description: "Google's navigation and mapping app",
		websiteUrl: "https://maps.google.com",
		tags: ["navigation", "maps", "android", "ios"],
	},
	// TODO: Add remaining proprietary apps from research
	// See PrivacyPack for initial list of ~83 apps
];
