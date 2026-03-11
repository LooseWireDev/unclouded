import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { fetchProprietaryApps } from "~/lib/server-fns";

export const Route = createFileRoute("/alternatives/")({
	head: () => ({
		meta: [{ title: "Alternatives — Unclouded" }],
	}),
	loader: () => fetchProprietaryApps({ data: { limit: 100 } }),
	component: AlternativesIndexPage,
});

function AlternativesIndexPage() {
	const apps = Route.useLoaderData();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-display text-[26px] font-semibold">
					Privacy Alternatives
				</h1>
				<p className="mt-1 text-muted-foreground">
					Find open source replacements for popular apps
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{apps.map((app) => (
					<Link
						key={app.id}
						to="/alternatives/$slug"
						params={{ slug: app.slug }}
						className="group block"
					>
						<Card
							size="sm"
							className="transition-all group-hover:border-sun-border group-hover:ring-sun-border"
						>
							<CardHeader>
								<div className="flex items-start gap-3">
									{app.iconUrl ? (
										<img
											src={app.iconUrl}
											alt=""
											className="size-10 shrink-0 rounded-lg object-cover"
											loading="lazy"
										/>
									) : (
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">
											{app.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="min-w-0 flex-1">
										<CardTitle className="truncate">{app.name}</CardTitle>
										{app.description && (
											<CardDescription className="mt-0.5 line-clamp-2">
												{app.description}
											</CardDescription>
										)}
									</div>
								</div>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
