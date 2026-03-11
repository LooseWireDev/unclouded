import { createFileRoute } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { fetchRecentApps } from "~/lib/server-fns";

export const Route = createFileRoute("/discover")({
	head: () => ({
		meta: [{ title: "Discover — Unclouded" }],
	}),
	loader: () => fetchRecentApps(),
	component: DiscoverPage,
});

function DiscoverPage() {
	const apps = Route.useLoaderData();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-display text-[26px] font-semibold">
					Recently Added
				</h1>
				<p className="mt-1 text-muted-foreground">
					The latest privacy-friendly apps added to our catalog
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{apps.map((app) => (
					<AppCard
						key={app.id}
						name={app.name}
						slug={app.slug}
						description={app.description}
						iconUrl={app.iconUrl}
					/>
				))}
			</div>
		</div>
	);
}
