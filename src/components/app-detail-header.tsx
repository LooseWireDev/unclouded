import { CodeIcon, EarthIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { AppAvatar } from "~/components/app-avatar";
import { HtmlDescription } from "~/components/html-description";
import { Button } from "~/components/ui/button";

const MAX_DESCRIPTION_HEIGHT = 160;

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
	const [expanded, setExpanded] = useState(false);
	const [needsTruncation, setNeedsTruncation] = useState(false);
	const descRef = useRef<HTMLDivElement>(null);

	function handleDescRef(el: HTMLDivElement | null) {
		(descRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
		if (el) {
			setNeedsTruncation(el.scrollHeight > MAX_DESCRIPTION_HEIGHT);
		}
	}

	return (
		<div className="flex gap-5">
			<AppAvatar iconUrl={iconUrl} name={name} size="lg" />

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-3">
					<h1 className="font-display text-2xl font-semibold leading-tight text-foreground">
						{name}
					</h1>
					{license && (
						<span className="inline-flex h-6 items-center rounded-4xl border border-border bg-muted px-2.5 text-xs font-medium text-muted-foreground">
							{license}
						</span>
					)}
				</div>

				{description && (
					<div className="relative mt-2">
						<div
							ref={handleDescRef}
							className="overflow-hidden transition-[max-height] duration-300"
							style={{
								maxHeight: expanded ? undefined : `${MAX_DESCRIPTION_HEIGHT}px`,
							}}
						>
							<HtmlDescription html={description} />
						</div>
						{needsTruncation && !expanded && (
							<div className="absolute inset-x-0 bottom-0 flex h-16 items-end bg-gradient-to-t from-background to-transparent">
								<button
									type="button"
									className="text-sm font-medium text-sun-text hover:underline"
									onClick={() => setExpanded(true)}
								>
									Show more
								</button>
							</div>
						)}
						{needsTruncation && expanded && (
							<button
								type="button"
								className="mt-1 text-sm font-medium text-sun-text hover:underline"
								onClick={() => setExpanded(false)}
							>
								Show less
							</button>
						)}
					</div>
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
