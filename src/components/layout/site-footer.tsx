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
						href="https://ko-fi.com/loosewire"
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground transition-colors hover:text-foreground"
						title="Support on Ko-fi"
					>
						<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
						</svg>
						<span className="sr-only">Ko-fi</span>
					</a>
					<a
						href="https://github.com/sponsors/LooseWireDev"
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground transition-colors hover:text-foreground"
						title="Sponsor on GitHub"
					>
						<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17.625 1.499c-2.32 0-4.354 1.203-5.625 3.03-1.271-1.827-3.305-3.03-5.625-3.03C3.129 1.499 0 4.253 0 8.249c0 4.275 3.068 7.847 5.828 10.227a33.14 33.14 0 0 0 5.616 3.876l.028.017.008.003-.001.003c.163.085.342.126.521.125.179.001.358-.041.521-.125l-.001-.003.008-.003.028-.017a33.14 33.14 0 0 0 5.616-3.876C20.932 16.096 24 12.524 24 8.249c0-3.996-3.129-6.75-6.375-6.75z" />
						</svg>
						<span className="sr-only">Sponsor</span>
					</a>
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
