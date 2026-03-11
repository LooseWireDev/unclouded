import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppCard } from "~/components/app-card";
import { PageLayout } from "~/components/layout/page-layout";
import { Pagination } from "~/components/pagination";
import { TagFilter } from "~/components/tag-filter";
import { fetchApps, fetchTags } from "~/lib/server-fns";

const LIMIT = 25;

interface AppsSearch {
	tags?: string;
	page?: number;
}

export const Route = createFileRoute("/apps/")({
	validateSearch: (search: Record<string, unknown>): AppsSearch => ({
		tags: typeof search.tags === "string" ? search.tags : undefined,
		page:
			typeof search.page === "number" ? Math.max(1, search.page) : undefined,
	}),
	loaderDeps: ({ search }) => ({
		tags: search.tags,
		page: search.page,
	}),
	loader: async ({ deps }) => {
		const tagSlugs = deps.tags
			? deps.tags.split(",").filter(Boolean)
			: undefined;
		const page = deps.page ?? 1;

		const [apps, tags] = await Promise.all([
			fetchApps({ data: { tagSlugs, page, limit: LIMIT + 1 } }),
			fetchTags(),
		]);

		const hasMore = apps.length > LIMIT;
		const displayApps = hasMore ? apps.slice(0, LIMIT) : apps;

		return { apps: displayApps, tags, hasMore, page };
	},
	component: AppsPage,
});

function AppsPage() {
	const { apps, tags, hasMore, page } = Route.useLoaderData();
	const { tags: tagsParam } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const selectedSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

	function handleToggle(slug: string) {
		const next = selectedSlugs.includes(slug)
			? selectedSlugs.filter((s) => s !== slug)
			: [...selectedSlugs, slug];

		navigate({
			search: {
				tags: next.length > 0 ? next.join(",") : undefined,
				page: undefined,
			},
		});
	}

	const searchParams: Record<string, string> = {};
	if (tagsParam) searchParams.tags = tagsParam;

	return (
		<PageLayout
			sidebar={
				<TagFilter
					tags={tags}
					selectedSlugs={selectedSlugs}
					onToggle={handleToggle}
				/>
			}
		>
			<div>
				<div className="mb-6 flex items-baseline justify-between">
					<h1 className="font-display text-2xl font-semibold">Apps</h1>
					<span className="text-sm text-muted-foreground">
						Showing page {page}
					</span>
				</div>

				{apps.length === 0 ? (
					<div className="py-16 text-center">
						<p className="text-lg text-muted-foreground">
							No apps match the selected filters.
						</p>
						{selectedSlugs.length > 0 && (
							<button
								type="button"
								className="mt-3 text-sm text-sun-text hover:underline"
								onClick={() => navigate({ search: {} })}
							>
								Clear all filters
							</button>
						)}
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{apps.map((app) => (
								<AppCard
									key={app.id}
									name={app.name}
									slug={app.slug}
									description={app.description}
									iconUrl={app.iconUrl}
								/>
							))}
						</div>

						<Pagination
							currentPage={page}
							hasMore={hasMore}
							basePath="/apps"
							searchParams={searchParams}
						/>
					</>
				)}
			</div>
		</PageLayout>
	);
}
