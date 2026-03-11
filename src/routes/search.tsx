import { createFileRoute } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { SearchBar } from "~/components/search-bar";
import { fetchSearchResults } from "~/lib/server-fns";

export const Route = createFileRoute("/search")({
	validateSearch: (search: Record<string, unknown>) => ({
		q: (search.q as string) ?? "",
	}),
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ deps }) => {
		if (!deps.q.trim()) return { apps: [], proprietaryApps: [] };
		return fetchSearchResults({ data: { query: deps.q } });
	},
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const { apps, proprietaryApps } = Route.useLoaderData();
	const hasQuery = q.trim().length > 0;
	const hasResults = apps.length > 0 || proprietaryApps.length > 0;

	return (
		<div className="space-y-8">
			<SearchBar size="lg" defaultValue={q} />

			{!hasQuery && (
				<p className="text-center text-muted-foreground">
					Start typing to search...
				</p>
			)}

			{hasQuery && !hasResults && (
				<p className="text-center text-muted-foreground">
					No results found for &lsquo;{q}&rsquo;
				</p>
			)}

			{apps.length > 0 && (
				<section>
					<h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
						Open Source Apps
					</h2>
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
				</section>
			)}

			{proprietaryApps.length > 0 && (
				<section>
					<h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
						Proprietary Apps
					</h2>
					<ul className="space-y-2">
						{proprietaryApps.map((app) => (
							<li key={app.id}>
								<a
									href={`/alternatives/${app.slug}`}
									className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
								>
									{app.iconUrl ? (
										<img
											src={app.iconUrl}
											alt=""
											className="size-8 shrink-0 rounded-lg object-cover"
											loading="lazy"
										/>
									) : (
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
											{app.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="min-w-0">
										<p className="truncate font-medium">{app.name}</p>
										<p className="text-xs text-muted-foreground">
											has open source alternatives
										</p>
									</div>
								</a>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
