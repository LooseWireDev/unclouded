import type { AlternativeSeed } from "../lib/types";

/**
 * Curated alternative mappings.
 * Uses proprietary slug + app package name (or slug for web-only apps).
 */
export const alternativeMappings: AlternativeSeed[] = [
	{
		proprietarySlug: "whatsapp",
		appPackageName: "org.thoughtcrime.securesms",
		relationshipType: "direct",
	},
	{
		proprietarySlug: "whatsapp",
		appPackageName: "im.molly.app",
		relationshipType: "fork",
		notes: "Hardened Signal fork with additional security features",
	},
	{
		proprietarySlug: "chrome",
		appPackageName: "org.mozilla.fennec_fdroid",
		relationshipType: "direct",
	},
	{
		proprietarySlug: "google-maps",
		appPackageName: "net.osmand.plus",
		relationshipType: "direct",
	},
	// TODO: Add remaining alternative mappings from research
];
