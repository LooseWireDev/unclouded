import { createFileRoute } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { SITE_URL } from "~/lib/constants";
import { fetchRecentApps } from "~/lib/server-fns";

export const Route = createFileRoute("/discover")({
	head: () => ({
		meta: [
			{ title: "Discover — Unclouded" },
			{
				name: "description",
				content:
					"The latest privacy-friendly open source apps added to Unclouded.",
			},
			{ property: "og:title", content: "Discover — Unclouded" },
			{
				property: "og:description",
				content:
					"The latest privacy-friendly open source apps added to Unclouded.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/discover` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/discover` }],
	}),
	loader: () => fetchRecentApps(),
	component: DiscoverPage,
});

function DiscoverPage() {
	const apps = Route.useLoaderData();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Recently Added Open Source Apps",
		numberOfItems: apps.length,
		itemListElement: apps.map((app: any, index: number) => ({
			"@type": "ListItem",
			position: index + 1,
			url: `${SITE_URL}/apps/${app.slug}`,
			name: app.name,
		})),
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div className="space-y-6">
				<div>
					<Breadcrumb
						items={[{ label: "Home", href: "/" }, { label: "Recently Added" }]}
					/>
					<h1 className="font-display text-2xl font-semibold text-foreground">
						Recently Added
					</h1>
					<p className="mt-1 text-muted-foreground">
						The latest privacy-friendly apps added to our catalog
					</p>
				</div>

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
			</div>
		</PageLayout>
	);
}
