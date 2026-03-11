import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlternativeCard } from "~/components/alternative-card";
import { AppAvatar } from "~/components/app-avatar";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { SITE_URL } from "~/lib/constants";
import {
	fetchProprietaryAppAlternatives,
	fetchProprietaryAppBySlug,
} from "~/lib/server-fns";

type AlternativeResult = {
	app: {
		id: string;
		name: string;
		slug: string;
		description: string | null;
		iconUrl: string | null;
		sources: Array<{
			source: string;
			url: string | null;
			packageName: string | null;
		}>;
		tags: Array<{ id: string; name: string; slug: string }>;
	};
	relationshipType: string;
	notes: string | null;
};

export const Route = createFileRoute("/alternatives/$slug")({
	loader: async ({ params }) => {
		const propApp = await fetchProprietaryAppBySlug({
			data: { slug: params.slug },
		});
		if (!propApp) throw notFound();
		const alternatives = (await fetchProprietaryAppAlternatives({
			data: { proprietaryAppId: propApp.id },
		})) as AlternativeResult[];
		return { propApp, alternatives };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { propApp } = loaderData;
		const title = `Alternatives to ${propApp.name} — Unclouded`;
		const description = propApp.description
			? `Open source alternatives to ${propApp.name}: ${propApp.description}`
			: `Open source alternatives to ${propApp.name}. Find privacy-respecting replacements.`;
		const canonical = `${SITE_URL}/alternatives/${propApp.slug}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
			],
			links: [{ rel: "canonical", href: canonical }],
		};
	},
	component: AlternativeDetailPage,
});

function AlternativeDetailPage() {
	const { propApp, alternatives } = Route.useLoaderData();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Open Source Alternatives to ${propApp.name}`,
		numberOfItems: alternatives.length,
		itemListElement: alternatives.map((alt, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: `${SITE_URL}/apps/${alt.app.slug}`,
			name: alt.app.name,
		})),
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div className="space-y-8">
				<div>
					<Breadcrumb
						items={[
							{ label: "Home", href: "/" },
							{ label: "Alternatives", href: "/alternatives" },
							{ label: `Alternatives to ${propApp.name}` },
						]}
					/>
					<div className="flex items-start gap-4">
						<AppAvatar
							iconUrl={propApp.iconUrl}
							name={propApp.name}
							size="lg"
							className="rounded-xl"
						/>
						<div>
							<h1 className="font-display text-2xl font-semibold text-foreground">
								Alternatives to {propApp.name}
							</h1>
							{propApp.description && (
								<p className="mt-1 text-muted-foreground">
									{propApp.description}
								</p>
							)}
						</div>
					</div>
				</div>

				<section>
					<h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
						Open Source Alternatives to {propApp.name}
					</h2>

					{alternatives.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{alternatives.map((alt) => (
								<AlternativeCard
									key={alt.app.id}
									app={{
										name: alt.app.name,
										slug: alt.app.slug,
										description: alt.app.description,
										iconUrl: alt.app.iconUrl,
										sources: alt.app.sources,
										tags: alt.app.tags,
									}}
									relationshipType={
										alt.relationshipType as "direct" | "fork" | "partial"
									}
									notes={alt.notes}
								/>
							))}
						</div>
					) : (
						<p className="text-muted-foreground">
							No alternatives found yet. Check back soon.
						</p>
					)}
				</section>

				{/* Internal links */}
				<nav className="flex flex-wrap gap-3 border-t border-border pt-6 text-sm">
					<Link
						to="/alternatives"
						className="font-medium text-sun-text hover:text-primary"
					>
						See more alternatives
					</Link>
				</nav>
			</div>
		</PageLayout>
	);
}
