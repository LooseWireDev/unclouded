import { cn } from "~/lib/utils";

const sourceStyles: Record<string, string> = {
	fdroid: "border-blue-500/30 bg-blue-500/10 text-blue-400",
	izzyondroid: "border-green-500/30 bg-green-500/10 text-green-400",
	github: "border-neutral-400/30 bg-neutral-400/10 text-neutral-300",
	obtainium: "border-purple-500/30 bg-purple-500/10 text-purple-400",
	direct: "border-orange-500/30 bg-orange-500/10 text-orange-400",
	play_store: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

const sourceLabels: Record<string, string> = {
	fdroid: "F-Droid",
	izzyondroid: "IzzyOnDroid",
	github: "GitHub",
	obtainium: "Obtainium",
	direct: "Direct",
	play_store: "Play Store",
};

interface SourceBadgeProps {
	source: string;
	url?: string;
	className?: string;
}

export function SourceBadge({ source, url, className }: SourceBadgeProps) {
	const style = sourceStyles[source] ?? sourceStyles.direct;
	const label = sourceLabels[source] ?? source;

	const classes = cn(
		"inline-flex h-5 items-center rounded-4xl border px-2 text-[10px] font-medium tracking-wide",
		style,
		className,
	);

	if (url) {
		return (
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className={cn(classes, "transition-opacity hover:opacity-80")}
			>
				{label}
			</a>
		);
	}

	return <span className={classes}>{label}</span>;
}
