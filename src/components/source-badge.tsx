import { cn } from "~/lib/utils";

const sourceStyles: Record<string, string> = {
	fdroid: "border-blue-500/30 bg-blue-500/10 text-blue-400",
	izzyondroid: "border-green-500/30 bg-green-500/10 text-green-400",
	github: "border-neutral-400/30 bg-neutral-400/10 text-neutral-300",
	gitlab: "border-orange-500/30 bg-orange-500/10 text-orange-400",
	codeberg: "border-teal-500/30 bg-teal-500/10 text-teal-400",
	sourceforge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
	direct: "border-purple-500/30 bg-purple-500/10 text-purple-400",
	play_store: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

const sourceLabels: Record<string, string> = {
	fdroid: "F-Droid",
	izzyondroid: "IzzyOnDroid",
	github: "GitHub",
	gitlab: "GitLab",
	codeberg: "Codeberg",
	sourceforge: "SourceForge",
	direct: "Direct",
	play_store: "Play Store",
};

interface SourceBadgeProps {
	source: string;
	url?: string;
	className?: string;
}

const hiddenSources = new Set(["obtainium"]);

/**
 * Normalize source URLs to user-friendly pages.
 * Strips raw.githubusercontent.com to the repo page, etc.
 */
function normalizeUrl(url: string): string | undefined {
	try {
		const parsed = new URL(url);
		// raw.githubusercontent.com/user/repo/... → github.com/user/repo
		if (parsed.hostname === "raw.githubusercontent.com") {
			const parts = parsed.pathname.split("/").filter(Boolean);
			if (parts.length >= 2) {
				return `https://github.com/${parts[0]}/${parts[1]}`;
			}
			return undefined;
		}
		return url;
	} catch {
		return undefined;
	}
}

export function SourceBadge({ source, url, className }: SourceBadgeProps) {
	if (hiddenSources.has(source)) return null;

	const style = sourceStyles[source] ?? sourceStyles.direct;
	const label = sourceLabels[source] ?? source;
	const resolvedUrl = url ? normalizeUrl(url) : undefined;

	const classes = cn(
		"inline-flex h-5 items-center rounded-4xl border px-2 text-[10px] font-medium tracking-wide",
		style,
		className,
	);

	if (resolvedUrl) {
		return (
			// biome-ignore lint/a11y/useSemanticElements: can't use <a> here — SourceBadge is rendered inside a card <a> link
			<span
				role="link"
				tabIndex={0}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					window.open(resolvedUrl, "_blank", "noopener,noreferrer");
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						window.open(resolvedUrl, "_blank", "noopener,noreferrer");
					}
				}}
				className={cn(
					classes,
					"cursor-pointer transition-opacity hover:opacity-80",
				)}
			>
				{label}
			</span>
		);
	}

	return <span className={classes}>{label}</span>;
}
