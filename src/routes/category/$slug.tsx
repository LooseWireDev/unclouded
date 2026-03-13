import {
	createFileRoute,
	Link,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { Pagination } from "~/components/pagination";
import { SITE_URL } from "~/lib/constants";
import { fetchAppsByTag, fetchTagBySlug } from "~/lib/server-fns";

const LIMIT = 24;

interface CategorySearch {
	page?: number;
}

export const Route = createFileRoute("/category/$slug")({
	validateSearch: (search: Record<string, unknown>): CategorySearch => ({
		page:
			typeof search.page === "number" ? Math.max(1, search.page) : undefined,
	}),
	loaderDeps: ({ search }) => ({
		page: search.page,
	}),
	loader: async ({ params, deps }) => {
		const page = deps.page ?? 1;

		const tag = await fetchTagBySlug({
			data: { slug: params.slug, type: "category" },
		});
		if (!tag) throw notFound();

		const apps = await fetchAppsByTag({
			data: { tagSlug: params.slug, page, limit: LIMIT + 1 },
		});

		if (apps.length === 0 && page > 1) {
			throw redirect({
				to: "/category/$slug",
				params,
				statusCode: 302,
			});
		}

		const hasMore = apps.length > LIMIT;
		const displayApps = hasMore ? apps.slice(0, LIMIT) : apps;

		return { tag, apps: displayApps, hasMore, page };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { tag } = loaderData;
		const label = tag.name.charAt(0).toUpperCase() + tag.name.slice(1);
		const title = `Open Source ${label} Apps — Unclouded`;
		const canonical = `${SITE_URL}/category/${tag.slug}`;
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: `Browse ${tag.appCount} open source ${tag.name} apps. Find privacy-respecting alternatives for ${tag.name}.`,
				},
				{ property: "og:title", content: title },
				{
					property: "og:description",
					content: `Browse ${tag.appCount} open source ${tag.name} apps. Find privacy-respecting alternatives.`,
				},
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
			],
			links: [
				{ rel: "canonical", href: canonical },
				...(loaderData.page > 1
					? [{ rel: "prev", href: `${canonical}?page=${loaderData.page - 1}` }]
					: []),
				...(loaderData.hasMore
					? [{ rel: "next", href: `${canonical}?page=${loaderData.page + 1}` }]
					: []),
			],
		};
	},
	component: CategoryPage,
});

function CategoryPage() {
	const { tag, apps, hasMore, page } = Route.useLoaderData();
	const { slug } = Route.useParams();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: `Open Source ${tag.name.charAt(0).toUpperCase() + tag.name.slice(1)} Apps`,
		url: `${SITE_URL}/category/${tag.slug}`,
		about: { "@type": "Thing", name: tag.name },
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: tag.appCount,
			itemListElement: apps.map((app: any, index: number) => ({
				"@type": "ListItem",
				position: (page - 1) * LIMIT + index + 1,
				url: `${SITE_URL}/apps/${app.slug}`,
				name: app.name,
			})),
		},
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div>
				<div className="mb-6">
					<Breadcrumb
						items={[
							{ label: "Home", href: "/" },
							{ label: "Categories", href: "/apps" },
							{ label: tag.name },
						]}
					/>
					<h1 className="font-display text-2xl font-semibold text-foreground capitalize">
						{tag.name}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{tag.appCount} open source {tag.name} apps
					</p>
				</div>

				{apps.length === 0 ? (
					<div className="py-16 text-center">
						<p className="text-lg text-muted-foreground">
							No apps in this category yet.
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

						<Pagination
							currentPage={page}
							hasMore={hasMore}
							basePath="/category/$slug"
							params={{ slug }}
						/>
					</>
				)}

				{/* Related navigation */}
				<nav className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6 text-sm">
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
