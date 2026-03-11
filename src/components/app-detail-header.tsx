import { CodeIcon, EarthIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "~/components/ui/button";

interface AppDetailHeaderProps {
	name: string;
	slug: string;
	description?: string | null;
	iconUrl?: string | null;
	license?: string | null;
	websiteUrl?: string | null;
	repositoryUrl?: string | null;
}

export function AppDetailHeader({
	name,
	description,
	iconUrl,
	license,
	websiteUrl,
	repositoryUrl,
}: AppDetailHeaderProps) {
	return (
		<div className="flex gap-5">
			{iconUrl ? (
				<img
					src={iconUrl}
					alt=""
					className="size-16 shrink-0 rounded-xl object-cover"
				/>
			) : (
				<div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl font-semibold text-muted-foreground">
					{name.charAt(0).toUpperCase()}
				</div>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-3">
					<h1 className="font-display text-[26px] font-semibold leading-tight">
						{name}
					</h1>
					{license && (
						<span className="inline-flex h-6 items-center rounded-4xl border border-border bg-muted px-2.5 text-xs font-medium text-muted-foreground">
							{license}
						</span>
					)}
				</div>

				{description && (
					<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}

				{(websiteUrl || repositoryUrl) && (
					<div className="mt-3 flex gap-2">
						{websiteUrl && (
							<a href={websiteUrl} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="sm">
									<HugeiconsIcon
										icon={EarthIcon}
										data-icon="inline-start"
										strokeWidth={2}
									/>
									Website
								</Button>
							</a>
						)}
						{repositoryUrl && (
							<a href={repositoryUrl} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="sm">
									<HugeiconsIcon
										icon={CodeIcon}
										data-icon="inline-start"
										strokeWidth={2}
									/>
									Source
								</Button>
							</a>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
