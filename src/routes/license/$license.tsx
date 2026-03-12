import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { Pagination } from "~/components/pagination";
import { SITE_URL } from "~/lib/constants";
import { fetchAppsByLicense } from "~/lib/server-fns";

const LIMIT = 24;

interface LicenseSearch {
	page?: number;
}

export const Route = createFileRoute("/license/$license")({
	validateSearch: (search: Record<string, unknown>): LicenseSearch => ({
		page:
			typeof search.page === "number" ? Math.max(1, search.page) : undefined,
	}),
	loaderDeps: ({ search }) => ({
		page: search.page,
	}),
	loader: async ({ params, deps }) => {
		const page = deps.page ?? 1;
		const license = decodeURIComponent(params.license);

		const apps = await fetchAppsByLicense({
			data: { license, page, limit: LIMIT + 1 },
		});

		if (apps.length === 0 && page === 1) throw notFound();

		const hasMore = apps.length > LIMIT;
		const displayApps = hasMore ? apps.slice(0, LIMIT) : apps;

		return { license, apps: displayApps, hasMore, page };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { license } = loaderData;
		const title = `${license} Apps — Unclouded`;
		const canonical = `${SITE_URL}/license/${encodeURIComponent(license)}`;
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: `Browse open source apps licensed under ${license}. Find privacy-respecting ${license} software.`,
				},
				{ property: "og:title", content: title },
				{
					property: "og:description",
					content: `Browse open source apps licensed under ${license}.`,
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
	component: LicensePage,
});

function LicensePage() {
	const { license, apps, hasMore, page } = Route.useLoaderData();
	const params = Route.useParams();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `${license} Licensed Apps`,
		numberOfItems: apps.length,
		itemListElement: apps.map((app: any, index: number) => ({
			"@type": "ListItem",
			position: (page - 1) * LIMIT + index + 1,
			url: `${SITE_URL}/apps/${app.slug}`,
			name: app.name,
		})),
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div>
				<div className="mb-6">
					<Breadcrumb
						items={[
							{ label: "Home", href: "/" },
							{ label: "Licenses", href: "/license" },
							{ label: license },
						]}
					/>
					<h1 className="font-display text-2xl font-semibold text-foreground">
						{license}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Open source apps licensed under {license}
					</p>
				</div>

				{apps.length === 0 ? (
					<div className="py-16 text-center">
						<p className="text-lg text-muted-foreground">
							No apps with this license yet.
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
							basePath="/license/$license"
							params={{ license: params.license }}
						/>
					</>
				)}
			</div>
		</PageLayout>
	);
}
