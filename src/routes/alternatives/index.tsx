import { createFileRoute, Link } from "@tanstack/react-router";
import { AppAvatar } from "~/components/app-avatar";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { SITE_URL } from "~/lib/constants";
import { fetchProprietaryApps } from "~/lib/server-fns";

export const Route = createFileRoute("/alternatives/")({
	head: () => ({
		meta: [
			{ title: "Alternatives — Unclouded" },
			{
				name: "description",
				content:
					"Find open source replacements for popular apps. Browse privacy-respecting alternatives.",
			},
			{ property: "og:title", content: "Alternatives — Unclouded" },
			{
				property: "og:description",
				content:
					"Find open source replacements for popular apps. Browse privacy-respecting alternatives.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/alternatives` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/alternatives` }],
	}),
	loader: () => fetchProprietaryApps({ data: { limit: 100 } }),
	component: AlternativesIndexPage,
});

function AlternativesIndexPage() {
	const apps = Route.useLoaderData();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Open Source Alternatives to Popular Apps",
		numberOfItems: apps.length,
		// biome-ignore lint/suspicious/noExplicitAny: loader return type
		itemListElement: apps.map((app: any, index: number) => ({
			"@type": "ListItem",
			position: index + 1,
			url: `${SITE_URL}/alternatives/${app.slug}`,
			name: `Alternatives to ${app.name}`,
		})),
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div className="space-y-6">
				<div>
					<Breadcrumb
						items={[{ label: "Home", href: "/" }, { label: "Alternatives" }]}
					/>
					<h1 className="font-display text-2xl font-semibold text-foreground">
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
		</PageLayout>
	);
}
