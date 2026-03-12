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
	{ name: "Fitness", slug: "fitness", type: "category" },
	{ name: "Finance", slug: "finance", type: "category" },
	{ name: "RSS", slug: "rss", type: "category" },
	{ name: "Photo Editing", slug: "photo-editing", type: "category" },
	{ name: "Office", slug: "office", type: "category" },
	{ name: "Podcast", slug: "podcast", type: "category" },
	{ name: "Torrent", slug: "torrent", type: "category" },
	{ name: "Firewall", slug: "firewall", type: "category" },
	{ name: "SMS", slug: "sms", type: "category" },
	{ name: "Backup", slug: "backup", type: "category" },
	{ name: "Media Player", slug: "media-player", type: "category" },
	{ name: "Games", slug: "games", type: "category" },
	{ name: "Ebook Reader", slug: "ebook-reader", type: "category" },
	{ name: "News", slug: "news", type: "category" },
	{ name: "Calculator", slug: "calculator", type: "category" },

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

export const fdroidCategoryMap: Record<string, string | string[]> = {
	// ─── Legacy F-Droid categories ───────────────────────
	Connectivity: "messaging",
	Development: "dev-tools",
	Graphics: "gallery",
	Internet: "browser",
	Money: "finance",
	Multimedia: "media-player",
	Navigation: "navigation",
	"Phone & SMS": "sms",
	Reading: "notes",
	"Science & Education": "productivity",
	Security: "password-manager",
	"Sports & Health": "fitness",
	System: "productivity",
	Theming: "launcher",
	Time: "calendar",
	Writing: "notes",

	// ─── Granular F-Droid / Izzy categories ──────────────
	// Media & entertainment
	"Local Media Player": "music",
	"Music Practice Tool": "music",
	"Online Media Player": "video",
	Podcast: "podcast",
	"Ebook Reader": "ebook-reader",
	"Media Downloader": "media-player",

	// Communication
	Messaging: "messaging",
	"Voice & Video Chat": "messaging",
	Email: "email",
	"Social Network": "social",
	Forum: "social",
	"SMS & MMS": "sms",

	// Productivity & organization
	Task: "productivity",
	Note: "notes",
	"Text Editor": "notes",
	"Calendar & Agenda": "calendar",
	"Habit Tracker": "productivity",
	Clock: "productivity",
	"Shopping List": "productivity",
	"Recipe Manager": "productivity",
	Inventory: "productivity",
	"Unit Convertor": "productivity",
	Calculator: "calculator",
	Office: "office",

	// Finance
	"Finance Manager": "finance",
	Wallet: "finance",
	"Pass Wallet": "finance",

	// Privacy & security
	"Password & 2FA": "password-manager",
	"File Encryption & Vault": "password-manager",
	VPN: "vpn",
	"VPN & Proxy": "vpn",
	Firewall: "firewall",
	"DNS & Hosts": "firewall",
	"Ad Blocker": "firewall",

	// Navigation & location
	"Public Transport": "navigation",
	"Location Tracker & Sharer": "navigation",
	Maps: "maps",

	// System & tools
	Browser: "browser",
	Bookmark: "browser",
	Launcher: "launcher",
	"Icon Pack": "launcher",
	Wallpaper: "launcher",
	Keyboard: "keyboard",
	"Keyboard & IME": "keyboard",
	Contact: "contacts",
	Gallery: "gallery",
	Camera: "camera",
	"File Manager": "file-manager",
	"File Transfer": "file-manager",
	"Cloud Storage & File Sync": "cloud-storage",
	Backup: "backup",
	"App Store & Updater": "app-store",

	// Health & fitness
	Workout: "fitness",

	// Creative
	Draw: "photo-editing",
	"Photo Editor": "photo-editing",

	// Information
	Weather: "weather",
	News: "news",
	"RSS Reader": "rss",
	"Translation & Dictionary": "translator",
	"AI Chat": "ai-assistant",

	// Tech
	"Network Analyzer": "dev-tools",
	"Developer Tool": "dev-tools",
	Torrent: "torrent",

	// Games
	Games: "games",
	"Board Game": "games",
	"Card Game": "games",
	Puzzle: "games",
	"Racing Game": "games",
	"Strategy Game": "games",
	"Word Game": "games",
	Trivia: "games",
	"Retro & Emulator": "games",
	"Game Collection": "games",
	"Music Game": "games",
	"Logic Game": "games",

	// Smart home
	"Home Automation": "smart-home",

	// ─── Obtainium categories (snake_case) ──────────────
	system: "productivity",
	utilities: "productivity",
	notes: "notes",
	synchronisation: "cloud-storage",
	sandboxing: "password-manager",
	research_and_development: "dev-tools",
	"research_&_development": "dev-tools",
	text_editors: "notes",
	launcher_and_desktop: "launcher",
	rss_readers: "rss",
	messaging: "messaging",
	games: "games",
	file_manager: "file-manager",
	calendar: "calendar",
	browser: "browser",
	automation: "productivity",
	video_player: "video",
	icon_packs: "launcher",
	wallpapers: "launcher",

	// Skip (no good fit): Religion
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
