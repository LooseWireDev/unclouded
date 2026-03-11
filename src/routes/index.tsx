import { Link, createFileRoute } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { PageLayout } from "~/components/layout/page-layout";
import { SearchBar } from "~/components/search-bar";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { fetchRecentApps, fetchTagsByType } from "~/lib/server-fns";

const popularAlternatives = [
	{ name: "WhatsApp", slug: "whatsapp" },
	{ name: "Google Maps", slug: "google-maps" },
	{ name: "Instagram", slug: "instagram" },
	{ name: "Chrome", slug: "chrome" },
	{ name: "YouTube", slug: "youtube" },
	{ name: "Gmail", slug: "gmail" },
];

export const Route = createFileRoute("/")({
	loader: async () => {
		const [recentApps, categories] = await Promise.all([
			fetchRecentApps(),
			fetchTagsByType({ data: { type: "category" } }),
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
		],
	}),
	component: HomePage,
});

function HomePage() {
	const { recentApps, categories } = Route.useLoaderData();

	return (
		<PageLayout>
			<div className="space-y-16">
				{/* Hero */}
				<section className="mx-auto max-w-2xl pt-12 pb-4 text-center">
					<h1 className="mb-4 font-display text-4xl font-normal italic tracking-tight text-foreground md:text-5xl">
						See clearly.{" "}
						<span className="not-italic font-semibold text-primary">
							Switch freely.
						</span>
					</h1>
					<p className="mb-8 text-base text-muted-foreground leading-relaxed">
						Find open source, privacy-respecting alternatives to the apps you
						use every day. Install them directly via Obtainium.
					</p>
					<SearchBar size="lg" placeholder="Search for an app..." />
				</section>

				{/* Categories */}
				{categories.length > 0 && (
					<section>
						<h2 className="mb-4 font-sans text-lg font-bold text-foreground">
							Browse by Category
						</h2>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
							{categories.map((cat) => (
								<Link
									key={cat.slug}
									to="/apps"
									search={{ tags: cat.slug }}
									className="group"
								>
									<Card
										size="sm"
										className="transition-all group-hover:border-sun-border"
									>
										<CardHeader>
											<CardTitle className="text-sm capitalize">
												{cat.name}
											</CardTitle>
										</CardHeader>
									</Card>
								</Link>
							))}
						</div>
					</section>
				)}

				{/* Recently Added */}
				{recentApps.length > 0 && (
					<section>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-sans text-lg font-bold text-foreground">
								Recently Added
							</h2>
							<Link
								to="/discover"
								className="text-sm font-medium text-sun-text transition-colors hover:text-primary"
							>
								View all
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{recentApps.slice(0, 9).map((app) => (
								<AppCard
									key={app.slug}
									name={app.name}
									slug={app.slug}
									description={app.description}
									iconUrl={app.iconUrl}
								/>
							))}
						</div>
					</section>
				)}

				{/* Popular Alternatives */}
				<section>
					<h2 className="mb-4 font-sans text-lg font-bold text-foreground">
						Popular Alternatives
					</h2>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{popularAlternatives.map((item) => (
							<Link
								key={item.slug}
								to="/alternatives/$slug"
								params={{ slug: item.slug }}
								className="group"
							>
								<Card
									size="sm"
									className="transition-all group-hover:border-sun-border"
								>
									<CardHeader>
										<CardTitle className="text-sm">
											Alternatives to {item.name}
										</CardTitle>
									</CardHeader>
								</Card>
							</Link>
						))}
					</div>
				</section>
			</div>
		</PageLayout>
	);
}
