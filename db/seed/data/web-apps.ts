import type { WebAppSeed } from "../lib/types";

/**
 * Curated web and desktop apps that don't have Android packages in F-Droid.
 * These are privacy-focused alternatives referenced in alternatives.ts
 * that need manual entries since they won't be discovered by repo parsers.
 */
export const webApps: WebAppSeed[] = [
	// ─── Email Services ─────────────────────────────────────
	{
		name: "Forward Email",
		slug: "forward-email",
		description:
			"Open-source email forwarding and hosting service with IMAP/SMTP support.",
		websiteUrl: "https://forwardemail.net",
		repositoryUrl: "https://github.com/forwardemail/forwardemail.net",
		tags: ["email", "open-source", "self-hostable", "encrypted", "web"],
	},
	{
		name: "Posteo",
		slug: "posteo",
		description:
			"Ad-free, privacy-focused email provider based in Berlin, powered by green energy.",
		websiteUrl: "https://posteo.de/en",
		tags: ["email", "encrypted", "ad-free", "no-tracking", "web"],
	},
	{
		name: "Migadu",
		slug: "migadu",
		description:
			"Privacy-respecting email hosting from Switzerland with unlimited mailboxes.",
		websiteUrl: "https://migadu.com",
		tags: ["email", "ad-free", "no-tracking", "web"],
	},
	{
		name: "StartMail",
		slug: "startmail",
		description:
			"Private email service with PGP encryption and unlimited aliases, from the makers of Startpage.",
		websiteUrl: "https://www.startmail.com",
		tags: ["email", "encrypted", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Runbox",
		slug: "runbox",
		description:
			"Secure email hosting from Norway, protected by strong Norwegian privacy laws.",
		websiteUrl: "https://runbox.com",
		tags: ["email", "encrypted", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Disroot Webmail",
		slug: "disroot-webmail",
		description:
			"Community-run email and collaboration platform with no tracking or ads.",
		websiteUrl: "https://disroot.org",
		tags: [
			"email",
			"open-source",
			"ad-free",
			"no-tracking",
			"decentralized",
			"web",
		],
	},
	{
		name: "Mailfence",
		slug: "mailfence",
		description:
			"Encrypted email suite from Belgium with OpenPGP, calendar, and contacts.",
		websiteUrl: "https://mailfence.com",
		tags: ["email", "encrypted", "no-tracking", "ad-free", "web"],
	},

	// ─── Search Engines ─────────────────────────────────────
	{
		name: "Kagi",
		slug: "kagi",
		description:
			"Ad-free, paid search engine with its own independent index and no tracking.",
		websiteUrl: "https://kagi.com",
		tags: ["search", "ad-free", "no-tracking", "web"],
	},
	{
		name: "SearXNG",
		slug: "searxng",
		description:
			"Self-hostable metasearch engine that aggregates results without tracking users.",
		websiteUrl: "https://searxng.org",
		repositoryUrl: "https://github.com/searxng/searxng",
		tags: [
			"search",
			"open-source",
			"self-hostable",
			"no-tracking",
			"ad-free",
			"web",
		],
	},
	{
		name: "Brave Search",
		slug: "brave-search",
		description:
			"Private search engine with its own independent index, no profiling or tracking.",
		websiteUrl: "https://search.brave.com",
		tags: ["search", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Startpage",
		slug: "startpage",
		description:
			"Private search engine that delivers Google results without tracking or profiling.",
		websiteUrl: "https://www.startpage.com",
		tags: ["search", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Mojeek",
		slug: "mojeek",
		description:
			"Independent search engine from the UK with its own crawler-based index and no tracking.",
		websiteUrl: "https://www.mojeek.com",
		tags: ["search", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Qwant",
		slug: "qwant",
		description:
			"French search engine that does not track users or sell personal data.",
		websiteUrl: "https://www.qwant.com",
		tags: ["search", "no-tracking", "ad-free", "web"],
	},

	// ─── Cloud Storage ──────────────────────────────────────
	{
		name: "Filen",
		slug: "filen",
		description:
			"Zero-knowledge encrypted cloud storage from Germany with open-source clients.",
		websiteUrl: "https://filen.io",
		repositoryUrl: "https://github.com/FilenCloudDienste",
		tags: [
			"cloud-storage",
			"encrypted",
			"open-source",
			"no-tracking",
			"web",
			"desktop",
		],
	},
	{
		name: "Tresorit",
		slug: "tresorit",
		description:
			"End-to-end encrypted cloud storage with zero-knowledge security for businesses and individuals.",
		websiteUrl: "https://tresorit.com",
		tags: ["cloud-storage", "encrypted", "no-tracking", "web", "desktop"],
	},
	{
		name: "Jottacloud",
		slug: "jottacloud",
		description:
			"Norwegian cloud storage service powered by renewable energy with strong privacy protections.",
		websiteUrl: "https://jottacloud.com",
		tags: ["cloud-storage", "encrypted", "web", "desktop"],
	},
	{
		name: "pCloud",
		slug: "pcloud",
		description:
			"Swiss cloud storage with optional client-side encryption and lifetime plans.",
		websiteUrl: "https://www.pcloud.com",
		tags: ["cloud-storage", "encrypted", "web", "desktop"],
	},
	{
		name: "Fileverse",
		slug: "fileverse",
		description:
			"Decentralized file sharing and collaboration platform using peer-to-peer storage.",
		websiteUrl: "https://fileverse.io",
		repositoryUrl: "https://github.com/fileverse",
		tags: [
			"cloud-storage",
			"encrypted",
			"open-source",
			"decentralized",
			"p2p",
			"web",
		],
	},

	// ─── VPN Services ───────────────────────────────────────
	{
		name: "Mullvad VPN",
		slug: "mullvad-vpn",
		description:
			"Open-source VPN service from Sweden with anonymous accounts and no logging.",
		websiteUrl: "https://mullvad.net",
		repositoryUrl: "https://github.com/mullvad/mullvadvpn-app",
		tags: [
			"vpn",
			"open-source",
			"no-tracking",
			"ad-free",
			"web",
			"desktop",
			"linux",
		],
	},
	{
		name: "IVPN",
		slug: "ivpn",
		description:
			"Audited, open-source VPN with anonymous signup and no email required.",
		websiteUrl: "https://www.ivpn.net",
		repositoryUrl: "https://github.com/ivpn",
		tags: ["vpn", "open-source", "no-tracking", "ad-free", "web", "desktop"],
	},
	{
		name: "Windscribe VPN",
		slug: "windscribe-vpn",
		description:
			"Open-source VPN service from Canada with ad blocking and transparency reports.",
		websiteUrl: "https://windscribe.com",
		repositoryUrl: "https://github.com/Windscribe/Desktop-App",
		tags: ["vpn", "open-source", "no-tracking", "web", "desktop"],
	},
	{
		name: "Obscura VPN",
		slug: "obscura-vpn",
		description:
			"Privacy-focused VPN with two-party architecture that makes logging impossible.",
		websiteUrl: "https://obscura.net",
		tags: ["vpn", "no-tracking", "desktop", "ios", "macos"],
	},
	{
		name: "Portmaster SPN",
		slug: "portmaster-spn",
		description:
			"Open-source application firewall with multi-hop privacy network, inspired by Tor.",
		websiteUrl: "https://safing.io",
		repositoryUrl: "https://github.com/safing/portmaster",
		tags: ["vpn", "open-source", "no-tracking", "desktop", "linux", "windows"],
	},

	// ─── DNS Services ───────────────────────────────────────
	{
		name: "Quad9",
		slug: "quad9-dns",
		description:
			"Free privacy-focused DNS resolver from Switzerland with malware blocking.",
		websiteUrl: "https://quad9.net",
		tags: ["productivity", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Mullvad DNS",
		slug: "mullvad-dns",
		description:
			"Privacy-respecting DNS resolver from Mullvad with ad and tracker blocking.",
		websiteUrl: "https://mullvad.net/en/help/dns-over-https-and-dns-over-tls",
		tags: ["productivity", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Control D",
		slug: "controld-dns",
		description:
			"Customizable DNS service that blocks ads, trackers, and malware at the DNS level.",
		websiteUrl: "https://controld.com",
		tags: ["productivity", "no-tracking", "ad-free", "web"],
	},
	{
		name: "NextDNS",
		slug: "nextdns",
		description:
			"Cloud-based DNS firewall with ad blocking, tracker blocking, and parental controls.",
		websiteUrl: "https://nextdns.io",
		tags: ["productivity", "no-tracking", "ad-free", "web"],
	},
	{
		name: "AdGuard DNS",
		slug: "adguard-dns",
		description:
			"Open-source DNS service that blocks ads, trackers, and malicious domains.",
		websiteUrl: "https://adguard-dns.io",
		repositoryUrl: "https://github.com/AdguardTeam/AdGuardDNS",
		tags: ["productivity", "open-source", "no-tracking", "ad-free", "web"],
	},
	{
		name: "OpenNIC",
		slug: "opennic",
		description:
			"User-owned DNS network offering privacy-respecting alternative to ICANN nameservers.",
		websiteUrl: "https://opennic.org",
		tags: [
			"productivity",
			"open-source",
			"no-tracking",
			"decentralized",
			"web",
		],
	},

	// ─── Smart Home ─────────────────────────────────────────
	{
		name: "Home Assistant",
		slug: "home-assistant",
		description:
			"Open-source home automation platform with local control and privacy-first design.",
		websiteUrl: "https://www.home-assistant.io",
		repositoryUrl: "https://github.com/home-assistant/core",
		tags: [
			"smart-home",
			"open-source",
			"self-hostable",
			"no-tracking",
			"offline-capable",
			"web",
			"desktop",
		],
	},
	{
		name: "openHAB",
		slug: "openhab",
		description:
			"Vendor-neutral open-source home automation platform with 200+ integrations.",
		websiteUrl: "https://www.openhab.org",
		repositoryUrl: "https://github.com/openhab/openhab-core",
		tags: [
			"smart-home",
			"open-source",
			"self-hostable",
			"no-tracking",
			"offline-capable",
			"web",
		],
	},
	{
		name: "Domoticz",
		slug: "domoticz",
		description:
			"Lightweight open-source home automation system for Linux, Windows, and Raspberry Pi.",
		websiteUrl: "https://www.domoticz.com",
		repositoryUrl: "https://github.com/domoticz/domoticz",
		tags: [
			"smart-home",
			"open-source",
			"self-hostable",
			"no-tracking",
			"offline-capable",
			"web",
			"linux",
		],
	},
	{
		name: "ioBroker",
		slug: "iobroker",
		description:
			"Open-source home automation platform with 300+ integrations, running on Node.js.",
		websiteUrl: "https://www.iobroker.net",
		repositoryUrl: "https://github.com/ioBroker/ioBroker",
		tags: [
			"smart-home",
			"open-source",
			"self-hostable",
			"no-tracking",
			"web",
			"linux",
		],
	},

	// ─── AI Assistants ──────────────────────────────────────
	{
		name: "Ollama",
		slug: "ollama",
		description:
			"Open-source framework for running large language models locally on your own hardware.",
		websiteUrl: "https://ollama.com",
		repositoryUrl: "https://github.com/ollama/ollama",
		tags: [
			"ai-assistant",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"macos",
			"windows",
		],
	},
	{
		name: "GPT4All",
		slug: "gpt4all",
		description:
			"Open-source desktop app for running local LLMs with no GPU required.",
		websiteUrl: "https://www.nomic.ai/gpt4all",
		repositoryUrl: "https://github.com/nomic-ai/gpt4all",
		tags: [
			"ai-assistant",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"macos",
			"windows",
		],
	},
	{
		name: "Jan",
		slug: "jan",
		description:
			"Open-source ChatGPT alternative that runs 100% offline on your computer.",
		websiteUrl: "https://jan.ai",
		repositoryUrl: "https://github.com/janhq/jan",
		tags: [
			"ai-assistant",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"macos",
			"windows",
		],
	},
	{
		name: "LocalAI",
		slug: "localai",
		description:
			"Self-hosted OpenAI-compatible API for running LLMs locally on consumer hardware.",
		websiteUrl: "https://localai.io",
		repositoryUrl: "https://github.com/mudler/LocalAI",
		tags: [
			"ai-assistant",
			"open-source",
			"self-hostable",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
		],
	},
	{
		name: "LM Studio",
		slug: "lm-studio",
		description:
			"Desktop app for discovering, downloading, and running local LLMs with a GUI.",
		websiteUrl: "https://lmstudio.ai",
		tags: [
			"ai-assistant",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"macos",
			"windows",
		],
	},
	{
		name: "Kagi Assistant",
		slug: "kagi-assistant",
		description:
			"Privacy-respecting AI assistant powered by multiple LLMs with no data harvesting.",
		websiteUrl: "https://kagi.com/assistant",
		tags: ["ai-assistant", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Brave Leo",
		slug: "brave-leo",
		description:
			"Browser-native AI assistant with anonymous, private conversations and no data retention.",
		websiteUrl: "https://brave.com/leo",
		tags: ["ai-assistant", "no-tracking", "ad-free", "web", "desktop"],
	},
	{
		name: "Duck AI",
		slug: "duck-ai",
		description:
			"Anonymous AI chat from DuckDuckGo with no data storage or model training on conversations.",
		websiteUrl: "https://duck.ai",
		tags: ["ai-assistant", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Lumo",
		slug: "lumo",
		description:
			"Zero-access encrypted AI assistant by Proton with no conversation logging.",
		websiteUrl: "https://lumo.proton.me",
		tags: ["ai-assistant", "encrypted", "no-tracking", "ad-free", "web"],
	},
	{
		name: "Maple AI",
		slug: "maple-ai",
		description:
			"End-to-end encrypted AI chat processed inside hardware-isolated secure enclaves.",
		websiteUrl: "https://trymaple.ai",
		tags: [
			"ai-assistant",
			"encrypted",
			"open-source",
			"no-tracking",
			"web",
			"desktop",
		],
	},
	{
		name: "Routstr",
		slug: "routstr",
		description:
			"Decentralized protocol for private AI inference using Nostr and Bitcoin micropayments.",
		websiteUrl: "https://routstr.com",
		repositoryUrl: "https://github.com/Routstr/routstr-core",
		tags: [
			"ai-assistant",
			"open-source",
			"decentralized",
			"no-tracking",
			"web",
		],
	},

	// ─── Maps ───────────────────────────────────────────────
	{
		name: "Kagi Maps",
		slug: "kagi-maps",
		description:
			"Privacy-focused map search that does not track location data or search history.",
		websiteUrl: "https://kagi.com/maps",
		tags: ["maps", "no-tracking", "ad-free", "web"],
	},

	// ─── Translator ─────────────────────────────────────────
	{
		name: "Kagi Translate",
		slug: "kagi-translate",
		description:
			"Ad-free translation service with no tracking, telemetry, or data collection.",
		websiteUrl: "https://translate.kagi.com",
		tags: ["translator", "no-tracking", "ad-free", "web"],
	},

	// ─── Documents ──────────────────────────────────────────
	{
		name: "dDocs",
		slug: "ddocs-new",
		description:
			"Decentralized, end-to-end encrypted document editor built on peer-to-peer storage.",
		websiteUrl: "https://docs.fileverse.io",
		repositoryUrl: "https://github.com/fileverse",
		tags: ["notes", "encrypted", "open-source", "decentralized", "p2p", "web"],
	},

	// ─── Photo Backup ───────────────────────────────────────
	{
		name: "Zeitkapsl",
		slug: "zeitkapsl",
		description:
			"End-to-end encrypted photo and video backup service hosted in the EU.",
		websiteUrl: "https://zeitkapsl.eu",
		repositoryUrl: "https://codeberg.org/zeitkapsl/zeitkapsl",
		tags: [
			"gallery",
			"encrypted",
			"open-source",
			"no-tracking",
			"web",
			"desktop",
		],
	},

	// ─── Password Managers ──────────────────────────────────
	{
		name: "AliasVault",
		slug: "aliasvault",
		description:
			"Self-hostable, end-to-end encrypted password and email alias manager.",
		websiteUrl: "https://www.aliasvault.net",
		repositoryUrl: "https://github.com/aliasvault/aliasvault",
		tags: [
			"password-manager",
			"encrypted",
			"open-source",
			"self-hostable",
			"web",
		],
	},
	{
		name: "gopass",
		slug: "gopass",
		description:
			"Team-friendly password manager for the command line, compatible with pass.",
		websiteUrl: "https://www.gopass.pw",
		repositoryUrl: "https://github.com/gopasspw/gopass",
		tags: [
			"password-manager",
			"encrypted",
			"open-source",
			"offline-capable",
			"desktop",
			"linux",
			"macos",
		],
	},
	{
		name: "Kee Vault",
		slug: "kee-vault",
		description:
			"Open-source password manager using KeePass format with browser-based access.",
		websiteUrl: "https://keevault.pm",
		repositoryUrl: "https://github.com/kee-org/keevault2",
		tags: ["password-manager", "encrypted", "open-source", "web"],
	},

	// ─── Operating Systems ──────────────────────────────────
	{
		name: "GrapheneOS",
		slug: "grapheneos",
		description:
			"Privacy and security focused mobile OS based on Android with hardened sandboxing.",
		websiteUrl: "https://grapheneos.org",
		repositoryUrl: "https://github.com/grapheneos",
		tags: ["os", "open-source", "no-tracking", "android"],
	},
	{
		name: "CalyxOS",
		slug: "calyxos",
		description:
			"Privacy-focused Android OS with verified boot and microG support.",
		websiteUrl: "https://calyxos.org",
		repositoryUrl: "https://gitlab.com/CalyxOS",
		tags: ["os", "open-source", "no-tracking", "android"],
	},
	{
		name: "LineageOS",
		slug: "lineageos",
		description:
			"Free and open-source Android distribution with broad device support.",
		websiteUrl: "https://lineageos.org",
		repositoryUrl: "https://github.com/LineageOS",
		tags: ["os", "open-source", "no-tracking", "android"],
	},
	{
		name: "Linux Mint",
		slug: "linux-mint",
		description:
			"User-friendly Linux distribution based on Ubuntu with a traditional desktop layout.",
		websiteUrl: "https://linuxmint.com",
		repositoryUrl: "https://github.com/linuxmint",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "Fedora",
		slug: "fedora",
		description:
			"Community-driven Linux distribution sponsored by Red Hat with cutting-edge packages.",
		websiteUrl: "https://fedoraproject.org",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "Ubuntu",
		slug: "ubuntu",
		description:
			"Popular Linux distribution by Canonical with long-term support releases.",
		websiteUrl: "https://ubuntu.com",
		tags: ["os", "open-source", "desktop", "linux"],
	},
	{
		name: "Pop!_OS",
		slug: "pop-os",
		description:
			"Linux distribution by System76 optimized for developers and creators.",
		websiteUrl: "https://pop.system76.com",
		repositoryUrl: "https://github.com/pop-os",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "Arch Linux",
		slug: "arch-linux",
		description:
			"Lightweight, rolling-release Linux distribution following a DIY philosophy.",
		websiteUrl: "https://archlinux.org",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "Debian",
		slug: "debian",
		description:
			"Stable, community-governed Linux distribution that forms the basis for many others.",
		websiteUrl: "https://www.debian.org",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "openSUSE",
		slug: "opensuse",
		description:
			"Linux distribution with both stable and rolling release options from the openSUSE Project.",
		websiteUrl: "https://www.opensuse.org",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "NixOS",
		slug: "nixos",
		description:
			"Linux distribution with declarative configuration and reproducible builds.",
		websiteUrl: "https://nixos.org",
		repositoryUrl: "https://github.com/NixOS/nixpkgs",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "Qubes OS",
		slug: "qubes-os",
		description:
			"Security-focused desktop OS that isolates applications in separate virtual machines.",
		websiteUrl: "https://www.qubes-os.org",
		repositoryUrl: "https://github.com/QubesOS",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},
	{
		name: "Zorin OS",
		slug: "zorin-os",
		description:
			"Linux distribution designed to be an accessible alternative to Windows and macOS.",
		websiteUrl: "https://zorin.com/os",
		tags: ["os", "open-source", "desktop", "linux"],
	},
	{
		name: "OpenMandriva",
		slug: "openmandriva",
		description:
			"Community-driven Linux distribution with KDE Plasma desktop and rolling releases.",
		websiteUrl: "https://www.openmandriva.org",
		repositoryUrl: "https://github.com/OpenMandrivaAssociation",
		tags: ["os", "open-source", "no-tracking", "desktop", "linux"],
	},

	// ─── Fitness/Health ─────────────────────────────────────
	{
		name: "wger",
		slug: "wger",
		description:
			"Self-hosted workout manager and fitness tracker with exercise database and REST API.",
		websiteUrl: "https://wger.de",
		repositoryUrl: "https://github.com/wger-project/wger",
		tags: ["fitness", "open-source", "self-hostable", "no-tracking", "web"],
	},

	// ─── Finance ────────────────────────────────────────────
	{
		name: "Firefly III",
		slug: "firefly-iii",
		description:
			"Self-hosted personal finance manager with budgeting, reports, and bank import.",
		websiteUrl: "https://www.firefly-iii.org",
		repositoryUrl: "https://github.com/firefly-iii/firefly-iii",
		tags: ["finance", "open-source", "self-hostable", "no-tracking", "web"],
	},
	{
		name: "Actual Budget",
		slug: "actual-budget",
		description:
			"Privacy-focused budgeting app with local-first data and optional sync server.",
		websiteUrl: "https://actualbudget.com",
		repositoryUrl: "https://github.com/actualbudget/actual",
		tags: [
			"finance",
			"open-source",
			"self-hostable",
			"offline-capable",
			"no-tracking",
			"web",
			"desktop",
		],
	},
	{
		name: "GnuCash",
		slug: "gnucash",
		description:
			"Free double-entry accounting software for personal and small business finance.",
		websiteUrl: "https://gnucash.org",
		repositoryUrl: "https://github.com/Gnucash/gnucash",
		tags: [
			"finance",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},

	// ─── RSS/News ───────────────────────────────────────────
	{
		name: "Miniflux",
		slug: "miniflux",
		description:
			"Minimalist self-hosted RSS reader with a clean interface and fast performance.",
		websiteUrl: "https://miniflux.app",
		repositoryUrl: "https://github.com/miniflux/v2",
		tags: ["rss", "open-source", "self-hostable", "no-tracking", "web"],
	},
	{
		name: "NewsBlur",
		slug: "newsblur",
		description:
			"Open-source RSS reader with social features and intelligence training.",
		websiteUrl: "https://newsblur.com",
		repositoryUrl: "https://github.com/samuelclay/NewsBlur",
		tags: ["rss", "open-source", "self-hostable", "web"],
	},

	// ─── Photo Editing ──────────────────────────────────────
	{
		name: "GIMP",
		slug: "gimp",
		description:
			"Free image editor for photo retouching, composition, and graphic design.",
		websiteUrl: "https://www.gimp.org",
		repositoryUrl: "https://gitlab.gnome.org/GNOME/gimp",
		tags: [
			"photo-editing",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "darktable",
		slug: "darktable",
		description:
			"Open-source photography workflow and RAW image editor for photographers.",
		websiteUrl: "https://www.darktable.org",
		repositoryUrl: "https://github.com/darktable-org/darktable",
		tags: [
			"photo-editing",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "RawTherapee",
		slug: "rawtherapee",
		description:
			"Open-source RAW image processing program with non-destructive editing.",
		websiteUrl: "https://rawtherapee.com",
		repositoryUrl: "https://github.com/Beep6581/RawTherapee",
		tags: [
			"photo-editing",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},

	// ─── Office Suite ───────────────────────────────────────
	{
		name: "LibreOffice",
		slug: "libreoffice",
		description:
			"Full-featured open-source office suite with word processor, spreadsheet, and presentations.",
		websiteUrl: "https://www.libreoffice.org",
		repositoryUrl: "https://github.com/LibreOffice/core",
		tags: [
			"office",
			"open-source",
			"offline-capable",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "CryptPad",
		slug: "cryptpad",
		description:
			"End-to-end encrypted collaborative office suite with documents, spreadsheets, and more.",
		websiteUrl: "https://cryptpad.org",
		repositoryUrl: "https://github.com/cryptpad/cryptpad",
		tags: [
			"office",
			"open-source",
			"self-hostable",
			"encrypted",
			"no-tracking",
			"web",
		],
	},
	{
		name: "ONLYOFFICE",
		slug: "onlyoffice",
		description:
			"Open-source office suite with collaborative editing and MS Office compatibility.",
		websiteUrl: "https://www.onlyoffice.com",
		repositoryUrl: "https://github.com/ONLYOFFICE/DocumentServer",
		tags: [
			"office",
			"open-source",
			"self-hostable",
			"no-tracking",
			"web",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},

	// ─── Torrent ────────────────────────────────────────────
	{
		name: "Transmission",
		slug: "transmission",
		description:
			"Lightweight open-source BitTorrent client with minimal resource usage.",
		websiteUrl: "https://transmissionbt.com",
		repositoryUrl: "https://github.com/transmission/transmission",
		tags: [
			"torrent",
			"open-source",
			"no-tracking",
			"ad-free",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "qBittorrent",
		slug: "qbittorrent",
		description:
			"Open-source BitTorrent client with a built-in search engine and no ads.",
		websiteUrl: "https://www.qbittorrent.org",
		repositoryUrl: "https://github.com/qbittorrent/qBittorrent",
		tags: [
			"torrent",
			"open-source",
			"no-tracking",
			"ad-free",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},

	// ─── Desktop Browsers ──────────────────────────────────
	{
		name: "LibreWolf",
		slug: "librewolf",
		description:
			"Privacy-focused Firefox fork with enhanced security defaults and no telemetry.",
		websiteUrl: "https://librewolf.net",
		repositoryUrl: "https://codeberg.org/librewolf/source",
		tags: [
			"browser",
			"open-source",
			"no-tracking",
			"ad-free",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "Mullvad Browser",
		slug: "mullvad-browser",
		description:
			"Privacy-focused browser developed by Mullvad VPN and the Tor Project to minimize tracking.",
		websiteUrl: "https://mullvad.net/en/browser",
		tags: [
			"browser",
			"open-source",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "Zen Browser",
		slug: "zen-browser",
		description:
			"Firefox-based browser with a focus on simplicity and privacy.",
		websiteUrl: "https://zen-browser.app",
		tags: [
			"browser",
			"open-source",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "Floorp",
		slug: "floorp",
		description:
			"Customizable Firefox-based browser from Japan with built-in privacy features.",
		websiteUrl: "https://floorp.app",
		tags: [
			"browser",
			"open-source",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "Waterfox",
		slug: "waterfox",
		description:
			"Firefox fork focused on speed, privacy, and legacy extension support.",
		websiteUrl: "https://www.waterfox.net",
		tags: [
			"browser",
			"open-source",
			"no-tracking",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "Orion",
		slug: "orion",
		description:
			"WebKit-based browser for macOS and iOS with native ad blocking and zero telemetry.",
		websiteUrl: "https://browser.kagi.com",
		tags: ["browser", "no-tracking", "ad-free", "desktop", "macos", "ios"],
	},
	{
		name: "Vanadium",
		slug: "vanadium",
		description: "Hardened Chromium browser included with GrapheneOS.",
		websiteUrl: "https://grapheneos.org",
		tags: ["browser", "open-source", "no-tracking", "android"],
	},
	{
		name: "Trivalent",
		slug: "trivalent",
		description:
			"Chromium-based browser for Android with privacy patches and no Google services.",
		websiteUrl: "https://nicktomlin.github.io/nicktomlin",
		// TODO: Find actual website URL
		tags: ["browser", "open-source", "no-tracking", "android"],
	},
	{
		name: "Tor Browser",
		slug: "tor",
		description:
			"Routes traffic through the Tor network for anonymous browsing.",
		websiteUrl: "https://www.torproject.org",
		repositoryUrl: "https://gitlab.torproject.org/tpo/applications/tor-browser",
		tags: [
			"browser",
			"open-source",
			"no-tracking",
			"encrypted",
			"decentralized",
			"desktop",
			"linux",
			"windows",
			"macos",
			"android",
		],
	},

	// ─── Messaging ─────────────────────────────────────────
	{
		name: "Dino",
		slug: "dino",
		description:
			"Modern XMPP chat client for desktop with support for OMEMO encryption.",
		websiteUrl: "https://dino.im",
		tags: [
			"messaging",
			"open-source",
			"encrypted",
			"decentralized",
			"desktop",
			"linux",
		],
	},
	{
		name: "Rocket.Chat",
		slug: "rocket-chat",
		description:
			"Open-source team communication platform with channels, direct messaging, and video calls.",
		websiteUrl: "https://www.rocket.chat",
		repositoryUrl: "https://github.com/RocketChat/Rocket.Chat",
		tags: ["messaging", "open-source", "self-hostable", "web", "desktop"],
	},
	{
		name: "Matrix",
		slug: "matrix",
		description:
			"Open standard for decentralized, encrypted real-time communication.",
		websiteUrl: "https://matrix.org",
		repositoryUrl: "https://github.com/matrix-org",
		tags: [
			"messaging",
			"open-source",
			"encrypted",
			"decentralized",
			"federated",
			"web",
			"desktop",
		],
	},

	// ─── Notes & Productivity ──────────────────────────────
	{
		name: "Memos",
		slug: "memos",
		description: "Lightweight, self-hosted memo hub for knowledge management.",
		websiteUrl: "https://www.usememos.com",
		repositoryUrl: "https://github.com/usememos/memos",
		tags: ["notes", "open-source", "self-hostable", "web"],
	},
	{
		name: "QOwnNotes",
		slug: "qownnotes",
		description:
			"Plain-text note taking app with Markdown support and Nextcloud integration.",
		websiteUrl: "https://www.qownnotes.org",
		repositoryUrl: "https://github.com/pbek/QOwnNotes",
		tags: [
			"notes",
			"open-source",
			"offline-capable",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},

	// ─── Photos & Gallery ──────────────────────────────────
	{
		name: "Nextcloud Memories",
		slug: "nextcloud-memories",
		description:
			"Photo management app for Nextcloud with timeline view and AI-powered features.",
		websiteUrl: "https://memories.gallery",
		tags: ["gallery", "open-source", "self-hostable", "web"],
	},
	{
		name: "PhotoPrism",
		slug: "photoprism",
		description:
			"Self-hosted photo management app with AI-powered search and face recognition.",
		websiteUrl: "https://www.photoprism.app",
		repositoryUrl: "https://github.com/photoprism/photoprism",
		tags: ["gallery", "open-source", "self-hostable", "web"],
	},

	// ─── Calendar & Contacts ───────────────────────────────
	{
		name: "Nextcloud Calendar",
		slug: "nextcloud-calendar",
		description: "CalDAV calendar app integrated with Nextcloud.",
		websiteUrl: "https://apps.nextcloud.com/apps/calendar",
		repositoryUrl: "https://github.com/nextcloud/calendar",
		tags: ["calendar", "open-source", "self-hostable", "web"],
	},
	{
		name: "Radicale",
		slug: "radicale",
		description:
			"Lightweight CalDAV and CardDAV server for self-hosting calendars and contacts.",
		websiteUrl: "https://radicale.org",
		repositoryUrl: "https://github.com/Kozea/Radicale",
		tags: ["calendar", "open-source", "self-hostable", "web"],
	},

	// ─── Cloud Storage ─────────────────────────────────────
	{
		name: "Mailbox.org",
		slug: "mailbox",
		description:
			"German email and cloud provider with calendar, contacts, and file storage.",
		websiteUrl: "https://mailbox.org",
		tags: [
			"email",
			"cloud-storage",
			"no-tracking",
			"ad-free",
			"encrypted",
			"web",
		],
	},

	// ─── Password Managers & Auth ──────────────────────────
	{
		name: "Vaultwarden",
		slug: "vaultwarden",
		description:
			"Lightweight self-hosted Bitwarden-compatible server written in Rust.",
		websiteUrl: "https://github.com/dani-garcia/vaultwarden",
		repositoryUrl: "https://github.com/dani-garcia/vaultwarden",
		tags: ["password-manager", "open-source", "self-hostable", "web"],
	},
	{
		name: "Bitwarden Authenticator",
		slug: "bitwarden-auth",
		description: "Standalone TOTP authenticator app from Bitwarden.",
		websiteUrl: "https://bitwarden.com/products/authenticator",
		tags: ["2fa", "open-source", "web", "android", "ios"],
	},

	// ─── App Stores ────────────────────────────────────────
	{
		name: "Accrescent",
		slug: "accrescent",
		description:
			"Privacy-focused Android app store with automatic security updates.",
		websiteUrl: "https://accrescent.app",
		tags: ["app-store", "open-source", "no-tracking", "android"],
	},

	// ─── VPN ───────────────────────────────────────────────
	{
		name: "Mozilla VPN",
		slug: "mozilla-vpn",
		description:
			"VPN service from Mozilla using the WireGuard protocol on the Mullvad network.",
		websiteUrl: "https://www.mozilla.org/en-US/products/vpn",
		tags: [
			"vpn",
			"no-tracking",
			"desktop",
			"android",
			"ios",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "URnetwork dVPN",
		slug: "urnetwork-dvpn",
		description: "Decentralized VPN built on a peer-to-peer network.",
		websiteUrl: "https://ur.io",
		tags: ["vpn", "decentralized", "p2p", "web"],
	},
	{
		name: "DuckDuckGo VPN",
		slug: "duckduckgo-vpn",
		description:
			"VPN service bundled with DuckDuckGo's Privacy Pro subscription.",
		websiteUrl: "https://duckduckgo.com/duckduckgo-help-pages/privacy-pro/vpn",
		tags: ["vpn", "no-tracking", "desktop", "android", "ios"],
	},

	// ─── Search ────────────────────────────────────────────
	{
		name: "DuckDuckGo",
		slug: "duckduckgo",
		description:
			"Privacy-focused search engine that doesn't track users or personalize results.",
		websiteUrl: "https://duckduckgo.com",
		tags: ["search", "no-tracking", "ad-free", "web"],
	},

	// ─── Maps ──────────────────────────────────────────────
	{
		name: "Magic Earth",
		slug: "magic-earth",
		description:
			"Free navigation app with offline maps and no data collection.",
		websiteUrl: "https://www.magicearth.com",
		tags: ["maps", "no-tracking", "offline-capable", "android", "ios"],
	},

	// ─── Translation ───────────────────────────────────────
	{
		name: "LibreTranslate",
		slug: "libretranslate",
		description:
			"Self-hosted machine translation API powered by open-source Argos Translate.",
		websiteUrl: "https://libretranslate.com",
		repositoryUrl: "https://github.com/LibreTranslate/LibreTranslate",
		tags: ["translator", "open-source", "self-hostable", "web"],
	},
	{
		name: "Translatelocally",
		slug: "translatelocally",
		description:
			"Offline machine translation that runs entirely on your device.",
		websiteUrl: "https://translatelocally.com",
		tags: ["translator", "open-source", "offline-capable", "desktop"],
	},
	{
		name: "Apertium",
		slug: "apertium",
		description:
			"Open-source rule-based machine translation platform for related languages.",
		websiteUrl: "https://apertium.org",
		repositoryUrl: "https://github.com/apertium",
		tags: ["translator", "open-source", "web"],
	},
	{
		name: "Firefox Translations",
		slug: "mozilla-translate",
		description:
			"Built-in Firefox feature for offline page translation without sending data to servers.",
		websiteUrl: "https://www.mozilla.org/firefox",
		tags: ["translator", "open-source", "offline-capable", "desktop"],
	},

	// ─── Dev Tools ─────────────────────────────────────────
	{
		name: "Bruno",
		slug: "bruno",
		description:
			"Open-source API client that stores collections directly in your filesystem.",
		websiteUrl: "https://www.usebruno.com",
		repositoryUrl: "https://github.com/usebruno/bruno",
		tags: [
			"dev-tools",
			"open-source",
			"offline-capable",
			"desktop",
			"linux",
			"windows",
			"macos",
		],
	},
	{
		name: "Hoppscotch",
		slug: "hoppscotch",
		description:
			"Open-source API development ecosystem with REST, GraphQL, and WebSocket support.",
		websiteUrl: "https://hoppscotch.io",
		repositoryUrl: "https://github.com/hoppscotch/hoppscotch",
		tags: ["dev-tools", "open-source", "self-hostable", "web"],
	},

	// ─── Email (Proton Mail) ───────────────────────────────
	{
		name: "Proton Mail",
		slug: "proton-mail",
		description: "End-to-end encrypted email service based in Switzerland.",
		websiteUrl: "https://proton.me/mail",
		tags: [
			"email",
			"encrypted",
			"no-tracking",
			"ad-free",
			"web",
			"android",
			"ios",
		],
	},

	// ─── SMS/Keyboard (Play Store only) ────────────────────
	{
		name: "QKSMS",
		slug: "qksms",
		description: "Open-source replacement for the stock Android messaging app.",
		websiteUrl: "https://github.com/moezbhatti/qksms",
		repositoryUrl: "https://github.com/moezbhatti/qksms",
		tags: ["sms", "open-source", "no-tracking", "android"],
	},
	{
		name: "OpenBoard",
		slug: "openboard",
		description: "Privacy-respecting open-source keyboard based on AOSP.",
		websiteUrl: "https://github.com/openboard-team/openboard",
		repositoryUrl: "https://github.com/openboard-team/openboard",
		tags: ["keyboard", "open-source", "no-tracking", "android"],
	},
	{
		name: "Seedvault",
		slug: "seedvault",
		description:
			"Encrypted Android backup solution built into custom ROMs like GrapheneOS and CalyxOS.",
		websiteUrl:
			"https://calyxinstitute.org/projects/seedvault-encrypted-backup-for-android",
		repositoryUrl: "https://github.com/seedvault-app/seedvault",
		tags: ["backup", "open-source", "encrypted", "android"],
	},
	{
		name: "Pocket Casts",
		slug: "pocket-casts",
		description:
			"Cross-platform podcast player with powerful playback and organization features.",
		websiteUrl: "https://pocketcasts.com",
		repositoryUrl: "https://github.com/Automattic/pocket-casts-android",
		tags: ["podcast", "open-source", "web", "android", "ios", "desktop"],
	},
	{
		name: "2FAS Authenticator",
		slug: "2fas-auth",
		description:
			"Open-source two-factor authentication app with cloud backup and browser extension.",
		websiteUrl: "https://2fas.com",
		repositoryUrl: "https://github.com/twofas",
		tags: ["2fa", "open-source", "no-tracking", "android", "ios"],
	},
];
