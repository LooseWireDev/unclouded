import { Link } from "@tanstack/react-router";
import { AppAvatar } from "~/components/app-avatar";
import { ObtainiumButton } from "~/components/obtainium-button";
import { SourceBadge } from "~/components/source-badge";
import { TagPill } from "~/components/tag-pill";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { stripHtml } from "~/lib/strip-html";
import { cn } from "~/lib/utils";

const relationshipStyles = {
	direct: {
		label: "Direct replacement",
		className: "border-green-500/30 bg-green-500/10 text-green-400",
	},
	fork: {
		label: "Fork",
		className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
	},
	partial: {
		label: "Partial",
		className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
	},
};

interface AlternativeCardProps {
	app: {
		id: string;
		name: string;
		slug: string;
		description?: string | null;
		iconUrl?: string | null;
		sources?: Array<{
			source: string;
			url: string | null;
			packageName?: string | null;
			metadata?: Record<string, unknown> | null;
		}>;
		tags?: Array<{ name: string; slug: string }>;
	};
	relationshipType: "direct" | "fork" | "partial";
	notes?: string | null;
}

export function AlternativeCard({
	app,
	relationshipType,
	notes,
}: AlternativeCardProps) {
	const relationship = relationshipStyles[relationshipType];

	return (
		<Link
			to="/apps/$slug"
			params={{ slug: app.slug }}
			className="group block h-full"
		>
			<Card
				size="sm"
				className="h-full transition-all group-hover:border-sun-border group-hover:ring-sun-border"
			>
				<CardHeader>
					<div className="flex items-start gap-3">
						<AppAvatar iconUrl={app.iconUrl} name={app.name} />
						<div className="min-w-0 flex-1">
							<CardTitle className="truncate">{app.name}</CardTitle>
							{app.description && (
								<CardDescription className="mt-0.5 line-clamp-2">
									{stripHtml(app.description)}
								</CardDescription>
							)}
						</div>
					</div>
				</CardHeader>

				<CardFooter className="mt-auto flex flex-wrap gap-1.5">
					<span
						className={cn(
							"inline-flex h-5 items-center rounded-4xl border px-2 text-[10px] font-medium tracking-wide",
							relationship.className,
						)}
					>
						{relationship.label}
					</span>
					{relationshipType === "partial" && notes && (
						<span className="text-xs text-muted-foreground">{notes}</span>
					)}
					{app.sources?.map((source) => (
						<SourceBadge
							key={source.source}
							source={source.source}
							url={source.url ?? undefined}
						/>
					))}
					{app.tags?.map((tag) => (
						<TagPill key={tag.slug} name={tag.name} slug={tag.slug} />
					))}
				</CardFooter>

				{app.sources && app.sources.length > 0 && (
					// biome-ignore lint/a11y/noStaticElementInteractions: prevents card link click-through
					<div
						className="px-4 pb-4"
						role="presentation"
						onClick={(e) => e.preventDefault()}
						onKeyDown={(e) => {
							if (e.key === "Enter") e.preventDefault();
						}}
					>
						<ObtainiumButton
							appId={app.id}
							sources={app.sources.filter(
								(s): s is typeof s & { url: string } => s.url !== null,
							)}
						/>
					</div>
				)}
			</Card>
		</Link>
	);
}
