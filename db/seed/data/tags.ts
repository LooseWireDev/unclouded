import type { TagSeed } from "../lib/types";

export const tagSeeds: TagSeed[] = [
	// ─── Category ────────────────────────────────────────
	{ name: "Messaging", slug: "messaging", type: "category" },
	{ name: "Browser", slug: "browser", type: "category" },
	{ name: "Email", slug: "email", type: "category" },
	{ name: "Navigation", slug: "navigation", type: "category" },
	{ name: "Maps", slug: "maps", type: "category" },
	{ name: "Camera", slug: "camera", type: "category" },
	{ name: "Gallery", slug: "gallery", type: "category" },
	{ name: "Keyboard", slug: "keyboard", type: "category" },
	{ name: "Launcher", slug: "launcher", type: "category" },
	{ name: "File Manager", slug: "file-manager", type: "category" },
	{ name: "Music", slug: "music", type: "category" },
	{ name: "Video", slug: "video", type: "category" },
	{ name: "Notes", slug: "notes", type: "category" },
	{ name: "Calendar", slug: "calendar", type: "category" },
	{ name: "Contacts", slug: "contacts", type: "category" },
	{ name: "Weather", slug: "weather", type: "category" },
	{ name: "Social", slug: "social", type: "category" },
	{ name: "Productivity", slug: "productivity", type: "category" },
	{ name: "Dev Tools", slug: "dev-tools", type: "category" },
	{ name: "VPN", slug: "vpn", type: "category" },
	{ name: "Cloud Storage", slug: "cloud-storage", type: "category" },
	{ name: "2FA", slug: "2fa", type: "category" },
	{ name: "Password Manager", slug: "password-manager", type: "category" },
	{ name: "Search", slug: "search", type: "category" },
	{ name: "Smart Home", slug: "smart-home", type: "category" },
	{ name: "Translator", slug: "translator", type: "category" },
	{ name: "AI Assistant", slug: "ai-assistant", type: "category" },
	{ name: "App Store", slug: "app-store", type: "category" },
	{ name: "OS", slug: "os", type: "category" },

	// ─── Feature ─────────────────────────────────────────
	{ name: "Encrypted", slug: "encrypted", type: "feature" },
	{ name: "Self-Hostable", slug: "self-hostable", type: "feature" },
	{ name: "Offline Capable", slug: "offline-capable", type: "feature" },
	{ name: "No Tracking", slug: "no-tracking", type: "feature" },
	{ name: "Open Source", slug: "open-source", type: "feature" },
	{ name: "Ad-Free", slug: "ad-free", type: "feature" },
	{ name: "Decentralized", slug: "decentralized", type: "feature" },
	{ name: "Federated", slug: "federated", type: "feature" },
	{ name: "Peer-to-Peer", slug: "p2p", type: "feature" },

	// ─── Compatibility ───────────────────────────────────
	{ name: "No GMS Required", slug: "no-gms", type: "compatibility" },
	{ name: "Root Required", slug: "root-required", type: "compatibility" },
	{ name: "Android Only", slug: "android-only", type: "compatibility" },
	{ name: "iOS Only", slug: "ios-only", type: "compatibility" },
	{ name: "Requires Server", slug: "requires-server", type: "compatibility" },

	// ─── Design ──────────────────────────────────────────
	{ name: "Material You", slug: "material-you", type: "design" },
	{ name: "Minimal", slug: "minimal", type: "design" },
	{ name: "Customizable", slug: "customizable", type: "design" },

	// ─── Platform ────────────────────────────────────────
	{ name: "Android", slug: "android", type: "platform" },
	{ name: "iOS", slug: "ios", type: "platform" },
	{ name: "Desktop", slug: "desktop", type: "platform" },
	{ name: "Web", slug: "web", type: "platform" },
	{ name: "Linux", slug: "linux", type: "platform" },
	{ name: "Windows", slug: "windows", type: "platform" },
	{ name: "macOS", slug: "macos", type: "platform" },
];

export const fdroidCategoryMap: Record<string, string> = {
	Connectivity: "messaging",
	Development: "dev-tools",
	Graphics: "gallery",
	Internet: "browser",
	Money: "productivity",
	Multimedia: "video",
	Navigation: "navigation",
	"Phone & SMS": "messaging",
	Reading: "notes",
	"Science & Education": "productivity",
	Security: "password-manager",
	"Sports & Health": "productivity",
	System: "productivity",
	Theming: "launcher",
	Time: "calendar",
	Writing: "notes",
};

export const fdroidAntiFeatureMap: Record<
	string,
	{ action: "remove"; tag: string } | { action: "note"; reason: string }
> = {
	NonFreeNet: { action: "remove", tag: "no-tracking" },
	Tracking: { action: "remove", tag: "no-tracking" },
	NonFreeAdd: { action: "remove", tag: "ad-free" },
	NonFreeDep: { action: "note", reason: "Has non-free dependencies" },
	NonFreeAssets: { action: "note", reason: "Has non-free assets" },
	UpstreamNonFree: { action: "note", reason: "Upstream is non-free" },
	DisabledAlgorithm: {
		action: "note",
		reason: "Uses disabled crypto algorithm",
	},
	KnownVuln: { action: "note", reason: "Has known vulnerabilities" },
	NoSourceSince: { action: "note", reason: "No source code updates" },
};
