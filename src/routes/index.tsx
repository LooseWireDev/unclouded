import { createFileRoute, Link } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { SearchBar } from "~/components/search-bar";
import { SITE_URL } from "~/lib/constants";
import { fetchCategoriesWithApps, fetchRecentApps } from "~/lib/server-fns";

const popularAlternatives = [
	{ name: "WhatsApp", slug: "whatsapp" },
	{ name: "Google Maps", slug: "google-maps" },
	{ name: "Instagram", slug: "instagram" },
	{ name: "Chrome", slug: "chrome" },
	{ name: "YouTube", slug: "youtube" },
	{ name: "Gmail", slug: "gmail" },
	{ name: "Google Drive", slug: "google-drive" },
	{ name: "Spotify", slug: "spotify" },
	{ name: "Google Play Store", slug: "google-play-store" },
	{ name: "Microsoft Office", slug: "microsoft-office" },
];

export const Route = createFileRoute("/")({
	loader: async () => {
		const [recentApps, categories] = await Promise.all([
			fetchRecentApps(),
			fetchCategoriesWithApps(),
		]);
		return { recentApps, categories };
	},
	head: () => ({
		meta: [
			{ title: "Unclouded — Find privacy-respecting alternatives" },
			{
				name: "description",
				content:
					"Discover open source, privacy-friendly alternatives to popular apps. Install directly via Obtainium.",
			},
			{
				property: "og:title",
				content: "Unclouded — Find privacy-respecting alternatives",
			},
			{
				property: "og:description",
				content:
					"Discover open source, privacy-friendly alternatives to popular apps. Install directly via Obtainium.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: SITE_URL },
		],
		links: [{ rel: "canonical", href: SITE_URL }],
	}),
	component: HomePage,
});

function HomePage() {
	const { recentApps, categories } = Route.useLoaderData();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Unclouded",
		url: SITE_URL,
		description:
			"Discover open source, privacy-friendly alternatives to popular apps.",
		potentialAction: {
			"@type": "SearchAction",
			target: `${SITE_URL}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div className="space-y-10">
				{/* Hero */}
				<section className="mx-auto max-w-xl pt-8 pb-2 text-center">
					<h1 className="font-display mb-2 text-2xl font-semibold text-foreground">
						Privacy-respecting app alternatives
					</h1>
					<p className="mb-5 text-sm text-muted-foreground">
						Discover open source replacements for the apps you use every day.
						Install directly via Obtainium.
					</p>
					<SearchBar size="lg" placeholder="Search for an app..." />
				</section>

				{/* Popular Alternatives — primary CTA */}
				<section>
					<h2 className="mb-3 font-sans text-base font-bold text-foreground">
						Popular Alternatives
					</h2>
					<div className="flex flex-wrap gap-2">
						{popularAlternatives.map((item) => (
							<Link
								key={item.slug}
								to="/alternatives/$slug"
								params={{ slug: item.slug }}
								className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors hover:border-sun-border hover:text-primary"
							>
								Replace {item.name}
							</Link>
						))}
					</div>
				</section>

				{/* Recently Added */}
				{recentApps.length > 0 && (
					<section>
						<div className="mb-3 flex items-center justify-between">
							<h2 className="font-sans text-base font-bold text-foreground">
								Recently Added
							</h2>
							<Link
								to="/discover"
								className="text-sm font-medium text-sun-text transition-colors hover:text-primary"
							>
								View all
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{recentApps.slice(0, 6).map((app: any) => (
								<AppCard
									key={app.slug}
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

				{/* Browse by Category — compact pills */}
				{categories.length > 0 && (
					<section>
						<h2 className="mb-3 font-sans text-base font-bold text-foreground">
							Browse by Category
						</h2>
						<div className="flex flex-wrap gap-2">
							{categories.map((cat) => (
								<Link
									key={cat.slug}
									to="/category/$slug"
									params={{ slug: cat.slug }}
									className="inline-flex h-8 items-center rounded-full bg-muted px-3.5 text-sm font-medium capitalize text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
								>
									{cat.name}
								</Link>
							))}
						</div>
					</section>
				)}
			</div>
		</PageLayout>
	);
}
