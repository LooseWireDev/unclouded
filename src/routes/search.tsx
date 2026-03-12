import { createFileRoute } from "@tanstack/react-router";
import { AppAvatar } from "~/components/app-avatar";
import { AppCard } from "~/components/app-card";
import { Breadcrumb } from "~/components/breadcrumb";
import { PageLayout } from "~/components/layout/page-layout";
import { SearchBar } from "~/components/search-bar";
import { SITE_URL } from "~/lib/constants";
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
	head: ({ loaderData }) => {
		const title = "Search — Unclouded";
		const description =
			"Search for open source, privacy-respecting apps and alternatives.";
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: `${SITE_URL}/search` },
			],
			links: [{ rel: "canonical", href: `${SITE_URL}/search` }],
		};
	},
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const { apps, proprietaryApps } = Route.useLoaderData();
	const hasQuery = q.trim().length > 0;
	const hasResults = apps.length > 0 || proprietaryApps.length > 0;

	return (
		<PageLayout>
			<div className="space-y-8">
				<Breadcrumb
					items={[{ label: "Home", href: "/" }, { label: "Search" }]}
				/>

				<h1 className="sr-only">Search Apps</h1>

				<SearchBar size="lg" defaultValue={q} />

				{!hasQuery && (
					<p className="text-center text-muted-foreground">
						Type a query and press Search to find apps.
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
							{apps.map((app: any) => (
								<AppCard
									key={app.id}
									name={app.name}
									slug={app.slug}
									description={app.description}
									iconUrl={app.iconUrl}
									sources={app.sources}
									tags={app.tags}
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
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{proprietaryApps.map((app: any) => (
								<a
									key={app.id}
									href={`/alternatives/${app.slug}`}
									className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-sun-border"
								>
									<AppAvatar name={app.name} iconUrl={app.iconUrl} size="sm" />
									<div className="min-w-0">
										<p className="truncate font-medium">{app.name}</p>
										<p className="text-xs text-muted-foreground">
											has open source alternatives
										</p>
									</div>
								</a>
							))}
						</div>
					</section>
				)}
			</div>
		</PageLayout>
	);
}
