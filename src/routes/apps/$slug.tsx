import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppAvatar } from "~/components/app-avatar";
import { AppDetailHeader } from "~/components/app-detail-header";
import { Breadcrumb } from "~/components/breadcrumb";
import { InstallSources } from "~/components/install-sources";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { SITE_URL } from "~/lib/constants";
import {
	fetchAppAlternatives,
	fetchAppBySlug,
	fetchComparisonPairsForApp,
} from "~/lib/server-fns";
import { stripHtml } from "~/lib/strip-html";

export const Route = createFileRoute("/apps/$slug")({
	loader: async ({ params }) => {
		const app = await fetchAppBySlug({ data: { slug: params.slug } });
		if (!app) throw notFound();

		const [alternatives, comparisons] = await Promise.all([
			fetchAppAlternatives({ data: { appId: app.id } }),
			fetchComparisonPairsForApp({ data: { appId: app.id, limit: 5 } }),
		]);

		return { app, alternatives, comparisons };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { app } = loaderData;
		const categoryTags = app.tags.filter(
			(t: { type: string }) => t.type === "category",
		);
		const categoryName = categoryTags.length > 0 ? categoryTags[0].name : null;
		const plainDescription = app.description
			? stripHtml(app.description)
			: `${app.name} — privacy-focused alternative`;
		const title = categoryName
			? `${app.name} — Privacy-Focused ${categoryName} App | Unclouded`
			: `${app.name} — Open Source App | Unclouded`;
		const metaDescription = categoryName
			? `${plainDescription.slice(0, 120)} — Compare privacy-focused ${categoryName.toLowerCase()} apps. Install via F-Droid or Obtainium.`
			: `${plainDescription.slice(0, 140)} — Install via F-Droid or Obtainium.`;
		const canonical = `${SITE_URL}/apps/${app.slug}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: metaDescription },
				{ property: "og:title", content: title },
				{ property: "og:description", content: metaDescription },
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: canonical },
				...(app.iconUrl ? [{ property: "og:image", content: app.iconUrl }] : []),
			],
			links: [{ rel: "canonical", href: canonical }],
		};
	},
	component: AppDetailPage,
});

function AppDetailPage() {
	const { app, alternatives, comparisons } = Route.useLoaderData();

	const categoryTags = app.tags.filter(
		(t: { type: string }) => t.type === "category",
	);
	const platformTags = app.tags.filter(
		(t: { type: string }) => t.type === "platform",
	);
	const categoryName = categoryTags.length > 0 ? categoryTags[0].name : null;
	const firstSource = app.sources[0];

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: app.name,
		applicationCategory:
			categoryTags.length > 0
				? categoryTags.map((t: { name: string }) => t.name).join(", ")
				: "Utility",
		operatingSystem:
			platformTags.length > 0
				? platformTags.map((t: { name: string }) => t.name).join(", ")
				: "Android",
		...(app.description && {
			description: stripHtml(app.description),
		}),
		...(app.license && { license: app.license }),
		...(app.websiteUrl && { url: app.websiteUrl }),
		...(firstSource?.url && { downloadUrl: firstSource.url }),
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	};

	const hasAlternativesOrComparisons =
		alternatives.length > 0 || comparisons.length > 0;

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div className="mx-auto max-w-3xl space-y-10">
				<Breadcrumb
					items={[
						{ label: "Home", href: "/" },
						{ label: "Apps", href: "/apps" },
						{ label: app.name },
					]}
				/>

				{/* ── Act 1: About ── */}
				<section>
					<h2 className="sr-only">About {app.name}</h2>
					<AppDetailHeader
						name={app.name}
						slug={app.slug}
						description={app.description}
						iconUrl={app.iconUrl}
						license={app.license}
						websiteUrl={app.websiteUrl}
						repositoryUrl={app.repositoryUrl}
						categoryName={categoryName}
						tags={app.tags}
					/>
				</section>

				{/* ── Act 2: Install ── */}
				{app.sources.length > 0 && (
					<section>
						<h2 className="mb-3 font-sans text-base font-bold text-foreground">
							Install
						</h2>
						<InstallSources sources={app.sources} appId={app.id} appName={app.name} />
					</section>
				)}

				{/* ── Act 3: Alternatives & Comparisons ── */}
				{hasAlternativesOrComparisons && (
					<section className="space-y-8">
						<h2 className="mb-3 font-sans text-base font-bold text-foreground">
							Alternatives & Comparisons
						</h2>

						{alternatives.length > 0 && (
							<div>
								<h3 className="mb-2 text-sm font-semibold text-muted-foreground">
									Replaces These Apps
								</h3>
								<div className="flex flex-wrap gap-2">
									{alternatives.map((alt) => (
										<Link
											key={alt.proprietaryApp.id}
											to="/alternatives/$slug"
											params={{ slug: alt.proprietaryApp.slug }}
											className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-sun-border"
										>
											<AppAvatar
												name={alt.proprietaryApp.name}
												iconUrl={alt.proprietaryApp.iconUrl}
												size="xs"
												className="rounded-full"
											/>
											{alt.proprietaryApp.name}
											<span className="text-xs text-muted-foreground capitalize">
												({alt.relationshipType})
											</span>
										</Link>
									))}
								</div>
							</div>
						)}

						{comparisons.length > 0 && (
							<div>
								<h3 className="mb-2 text-sm font-semibold text-muted-foreground">
									Compare with Similar Apps
								</h3>
								<div className="grid gap-3 sm:grid-cols-2">
									{comparisons.map(
										(pair: {
											id: string;
											slug: string;
											sharedTagCount: number;
											appA: {
												id: string;
												name: string;
												slug: string;
												iconUrl: string | null;
											};
											appB: {
												id: string;
												name: string;
												slug: string;
												iconUrl: string | null;
											};
										}) => {
											const other =
												pair.appA.id === app.id ? pair.appB : pair.appA;
											return (
												<Link
													key={pair.id}
													to="/compare/$pair"
													params={{ pair: pair.slug }}
													className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-sun-border"
												>
													<AppAvatar
														name={other.name}
														iconUrl={other.iconUrl}
														size="sm"
													/>
													<div className="min-w-0 flex-1">
														<p className="truncate text-sm font-medium text-foreground">
															vs {other.name}
														</p>
														<p className="text-xs text-muted-foreground">
															{pair.sharedTagCount} shared{" "}
															{pair.sharedTagCount === 1 ? "tag" : "tags"}
														</p>
													</div>
												</Link>
											);
										},
									)}
								</div>
							</div>
						)}
					</section>
				)}

				{/* ── Internal links ── */}
				<nav className="flex flex-wrap gap-3 border-t border-border pt-6 text-sm">
					{categoryTags.length > 0 && (
						<Link
							to="/category/$slug"
							params={{ slug: categoryTags[0].slug }}
							className="font-medium text-sun-text hover:text-primary"
						>
							More {categoryTags[0].name} apps
						</Link>
					)}
					<Link
						to="/apps"
						className="font-medium text-sun-text hover:text-primary"
					>
						Browse all apps
					</Link>
				</nav>
			</div>
		</PageLayout>
	);
}
