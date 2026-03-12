import { Link } from "@tanstack/react-router";
import { AppAvatar } from "~/components/app-avatar";
import { SourceBadge } from "~/components/source-badge";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
} from "~/components/ui/card";
import { stripHtml } from "~/lib/strip-html";
import { cn } from "~/lib/utils";

interface AppCardProps {
	name: string;
	slug: string;
	description?: string | null;
	iconUrl?: string | null;
	sources?: Array<{ source: string; url?: string }>;
	tags?: Array<{ name: string; slug: string; type?: string }>;
	className?: string;
}

const desktopSlugs = new Set(["linux", "macos", "windows", "desktop"]);

function getPlatformPills(
	tags: Array<{ name: string; slug: string; type?: string }>,
): string[] {
	const platformSlugs = new Set(
		tags.filter((t) => t.type === "platform").map((t) => t.slug),
	);
	const pills: string[] = [];
	if (platformSlugs.has("android")) pills.push("APK");
	if ([...platformSlugs].some((s) => desktopSlugs.has(s)))
		pills.push("Desktop");
	if (platformSlugs.has("ios")) pills.push("iOS");
	if (platformSlugs.has("web")) pills.push("Web");
	return pills.slice(0, 3);
}

export function AppCard({
	name,
	slug,
	description,
	iconUrl,
	sources,
	tags,
	className,
}: AppCardProps) {
	const platformPills = tags ? getPlatformPills(tags) : [];

	return (
		<Link to="/apps/$slug" params={{ slug }} className="group block h-full">
			<Card
				size="sm"
				className={cn(
					"h-full transition-all group-hover:border-sun-border group-hover:ring-sun-border",
					className,
				)}
			>
				<CardHeader className="overflow-hidden">
					<div className="flex items-start gap-3 overflow-hidden">
						<AppAvatar iconUrl={iconUrl} name={name} />
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-1.5">
								<span className="block truncate text-base font-medium">
									{name}
								</span>
								{platformPills.length > 0 && (
									<div className="flex shrink-0 gap-0.5">
										{platformPills.map((label) => (
											<span
												key={label}
												className="inline-flex h-4 items-center rounded px-1 text-[9px] font-medium uppercase tracking-wide text-text-mid bg-muted"
											>
												{label}
											</span>
										))}
									</div>
								)}
							</div>
							{description && (
								<CardDescription className="mt-0.5 line-clamp-2">
									{stripHtml(description)}
								</CardDescription>
							)}
						</div>
					</div>
				</CardHeader>

				{sources && sources.length > 0 && (
					<CardFooter className="mt-auto flex flex-wrap gap-1.5">
						{sources.map((source) => (
							<SourceBadge
								key={source.source}
								source={source.source}
								url={source.url}
							/>
						))}
					</CardFooter>
				)}
			</Card>
		</Link>
	);
}
