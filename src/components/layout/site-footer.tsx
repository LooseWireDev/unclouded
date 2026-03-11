import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SiteFooter() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
				<div className="flex flex-col items-center gap-1 sm:items-start">
					<span className="font-display text-sm font-bold text-foreground">
						unclouded
					</span>
					<span className="text-xs text-muted-foreground">
						See clearly. Switch freely.
					</span>
				</div>

				<div className="flex items-center gap-4">
					<a
						href="https://github.com/LooseWireDev/unclouded"
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground transition-colors hover:text-foreground"
					>
						<HugeiconsIcon
							icon={GithubIcon}
							className="size-5"
							strokeWidth={2}
						/>
						<span className="sr-only">GitHub</span>
					</a>
					<span className="rounded-4xl border border-border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
						AGPL-3.0
					</span>
				</div>
			</div>
		</footer>
	);
}
