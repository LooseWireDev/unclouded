import { Link } from "@tanstack/react-router";
import { SourceBadge } from "~/components/source-badge";
import { TagPill } from "~/components/tag-pill";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface AppCardProps {
	name: string;
	slug: string;
	description?: string | null;
	iconUrl?: string | null;
	sources?: Array<{ source: string; url?: string }>;
	tags?: Array<{ name: string; slug: string }>;
	className?: string;
}

function AppIcon({ iconUrl, name }: { iconUrl?: string | null; name: string }) {
	if (iconUrl) {
		return (
			<img
				src={iconUrl}
				alt=""
				className="size-10 shrink-0 rounded-lg object-cover"
				loading="lazy"
			/>
		);
	}

	return (
		<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">
			{name.charAt(0).toUpperCase()}
		</div>
	);
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
	return (
		<Link to="/apps/$slug" params={{ slug }} className="group block">
			<Card
				size="sm"
				className={cn(
					"transition-all group-hover:border-sun-border group-hover:ring-sun-border",
					className,
				)}
			>
				<CardHeader>
					<div className="flex items-start gap-3">
						<AppIcon iconUrl={iconUrl} name={name} />
						<div className="min-w-0 flex-1">
							<CardTitle className="truncate">{name}</CardTitle>
							{description && (
								<CardDescription className="mt-0.5 line-clamp-2">
									{description}
								</CardDescription>
							)}
						</div>
					</div>
				</CardHeader>

				{(sources?.length || tags?.length) && (
					<CardFooter className="flex flex-wrap gap-1.5">
						{sources?.map((source) => (
							<SourceBadge
								key={source.source}
								source={source.source}
								url={source.url}
							/>
						))}
						{tags?.map((tag) => (
							<TagPill key={tag.slug} name={tag.name} slug={tag.slug} />
						))}
					</CardFooter>
				)}
			</Card>
		</Link>
	);
}
