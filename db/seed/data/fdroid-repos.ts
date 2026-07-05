import type { SourceType } from "../../schema";

/**
 * Third-party F-Droid-format repositories (index-v2), typically run by the
 * app developers themselves. Each entry becomes its own source type so an
 * app can carry several repo sources without colliding on the
 * (app_id, source) unique constraint.
 */
export type ThirdPartyFdroidRepo = {
	/** Source type slug stored in app_sources.source */
	source: SourceType;
	/** Display name — also used as the Obtainium config author */
	name: string;
	/** Base repo URL; the index lives at `${repoUrl}/index-v2.json` */
	repoUrl: string;
	/** Human-facing page linked from source badges */
	webUrl: string;
	/** Filename inside .cache/ */
	cacheFile: string;
};

export const thirdPartyFdroidRepos: ThirdPartyFdroidRepo[] = [
	{
		source: "guardian",
		name: "Guardian Project",
		repoUrl: "https://guardianproject.info/fdroid/repo",
		webUrl: "https://guardianproject.info/fdroid/",
		cacheFile: "guardian-index.json",
	},
	{
		source: "microg",
		name: "microG",
		repoUrl: "https://microg.org/fdroid/repo",
		webUrl: "https://microg.org/download.html",
		cacheFile: "microg-index.json",
	},
	{
		source: "molly",
		name: "Molly",
		repoUrl: "https://molly.im/fdroid/foss/fdroid/repo",
		webUrl: "https://molly.im/download/fdroid/",
		cacheFile: "molly-index.json",
	},
	{
		source: "cromite",
		name: "Cromite",
		repoUrl: "https://www.cromite.org/fdroid/repo",
		webUrl: "https://www.cromite.org/",
		cacheFile: "cromite-index.json",
	},
	{
		source: "bitwarden",
		name: "Bitwarden",
		repoUrl: "https://mobileapp.bitwarden.com/fdroid/repo",
		webUrl: "https://bitwarden.com/download/",
		cacheFile: "bitwarden-index.json",
	},
	{
		source: "threema",
		name: "Threema Libre",
		repoUrl: "https://releases.threema.ch/fdroid/repo",
		webUrl: "https://threema.ch/en/faq/threema_libre",
		cacheFile: "threema-index.json",
	},
	{
		source: "session",
		name: "Session",
		repoUrl: "https://fdroid.getsession.org/fdroid/repo",
		webUrl: "https://getsession.org/download",
		cacheFile: "session-index.json",
	},
	{
		source: "briar",
		name: "Briar",
		repoUrl: "https://briarproject.org/fdroid/repo",
		webUrl: "https://briarproject.org/download-briar/",
		cacheFile: "briar-index.json",
	},
	{
		source: "simplex",
		name: "SimpleX Chat",
		repoUrl: "https://app.simplex.chat/fdroid/repo",
		webUrl: "https://simplex.chat/downloads/",
		cacheFile: "simplex-index.json",
	},
	{
		source: "newpipe",
		name: "NewPipe",
		repoUrl: "https://archive.newpipe.net/fdroid/repo",
		webUrl: "https://newpipe.net/",
		cacheFile: "newpipe-index.json",
	},
	{
		source: "calyx",
		name: "Calyx Institute",
		repoUrl: "https://calyxos.gitlab.io/calyx-fdroid-repo/fdroid/repo",
		webUrl: "https://calyxinstitute.org/",
		cacheFile: "calyx-index.json",
	},
];
