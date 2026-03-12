import { createFileRoute } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { SITE_URL } from "~/lib/constants";
import { fetchDesktopApps } from "~/lib/server-fns";

export const Route = createFileRoute("/desktop")({
	head: () => ({
		meta: [
			{ title: "Desktop Apps — Unclouded" },
			{
				name: "description",
				content:
					"Privacy-friendly open source apps for Linux, macOS, and Windows.",
			},
			{ property: "og:title", content: "Desktop Apps — Unclouded" },
			{
				property: "og:description",
				content:
					"Privacy-friendly open source apps for Linux, macOS, and Windows.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/desktop` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/desktop` }],
	}),
	loader: () => fetchDesktopApps({ data: {} }),
	component: DesktopPage,
});

function DesktopPage() {
	const apps = Route.useLoaderData();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Open Source Desktop Apps",
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
						items={[
							{ label: "Home", href: "/" },
							{ label: "Desktop Apps" },
						]}
					/>
					<h1 className="font-display text-2xl font-semibold text-foreground">
						Desktop Apps
					</h1>
					<p className="mt-1 text-muted-foreground">
						Privacy-friendly open source apps for Linux, macOS, and Windows
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
