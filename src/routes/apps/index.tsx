import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppCard } from "~/components/app-card";
import { Breadcrumb } from "~/components/breadcrumb";
import {
	type GridLayout,
	GridLayoutSwitcher,
	gridLayoutClasses,
} from "~/components/grid-layout-switcher";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { Pagination } from "~/components/pagination";
import { SITE_URL } from "~/lib/constants";
import { fetchApps, fetchTags } from "~/lib/server-fns";
import { cn } from "~/lib/utils";

const DEFAULT_LIMIT = 25;
const LIMIT_OPTIONS = [25, 50, 100];
const STORAGE_KEY = "unclouded-grid-layout";

function getStoredLayout(): GridLayout {
	if (typeof window === "undefined") return "3";
	return (localStorage.getItem(STORAGE_KEY) as GridLayout) || "3";
}

interface AppsSearch {
	tags?: string;
	page?: number;
	limit?: number;
}

export const Route = createFileRoute("/apps/")({
	head: () => ({
		meta: [
			{ title: "Apps — Unclouded" },
			{
				name: "description",
				content:
					"Browse thousands of open source, privacy-respecting apps. Filter by category, platform, and features.",
			},
			{ property: "og:title", content: "Apps — Unclouded" },
			{
				property: "og:description",
				content:
					"Browse thousands of open source, privacy-respecting apps. Filter by category, platform, and features.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/apps` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/apps` }],
	}),
	validateSearch: (search: Record<string, unknown>): AppsSearch => ({
		tags: typeof search.tags === "string" ? search.tags : undefined,
		page:
			typeof search.page === "number" ? Math.max(1, search.page) : undefined,
		limit:
			typeof search.limit === "number" && LIMIT_OPTIONS.includes(search.limit)
				? search.limit
				: undefined,
	}),
	loaderDeps: ({ search }) => ({
		tags: search.tags,
		page: search.page,
		limit: search.limit,
	}),
	loader: async ({ deps }) => {
		const tagSlugs = deps.tags
			? deps.tags.split(",").filter(Boolean)
			: undefined;
		const page = deps.page ?? 1;
		const limit = deps.limit ?? DEFAULT_LIMIT;

		const [apps, tags] = await Promise.all([
			fetchApps({ data: { tagSlugs, page, limit: limit + 1 } }),
			fetchTags(),
		]);

		if (apps.length === 0 && page > 1) {
			throw redirect({
				to: "/apps",
				search: tagSlugs?.length ? { tags: tagSlugs.join(",") } : undefined,
				statusCode: 302,
			});
		}

		const hasMore = apps.length > limit;
		const displayApps = hasMore ? apps.slice(0, limit) : apps;

		return { apps: displayApps, tags, hasMore, page, limit };
	},
	component: AppsPage,
});

function AppsPage() {
	const { apps, tags, hasMore, page, limit } = Route.useLoaderData();
	const { tags: tagsParam } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [gridLayout, setGridLayout] = useState<GridLayout>(getStoredLayout);

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

	function handleLayoutChange(layout: GridLayout) {
		setGridLayout(layout);
		localStorage.setItem(STORAGE_KEY, layout);
	}

	const searchParams: Record<string, string | number> = {};
	if (tagsParam) searchParams.tags = tagsParam;
	if (limit !== DEFAULT_LIMIT) searchParams.limit = limit;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Open Source Privacy-Respecting Apps",
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
			<div>
				<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Apps" }]} />
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<h1 className="font-display text-2xl font-semibold text-foreground">
						Apps
					</h1>
					<div className="flex items-center gap-3">
						<GridLayoutSwitcher
							value={gridLayout}
							onChange={handleLayoutChange}
						/>
						<label className="flex items-center gap-2 text-sm text-muted-foreground">
							Show
							<select
								value={limit}
								onChange={(e) =>
									navigate({
										search: {
											tags: tagsParam || undefined,
											page: undefined,
											limit:
												Number(e.target.value) === DEFAULT_LIMIT
													? undefined
													: Number(e.target.value),
										},
									})
								}
								className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
							>
								{LIMIT_OPTIONS.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
							per page
						</label>
					</div>
				</div>

				{/* Category / tag filters as horizontal dropdowns */}
				<div className="mb-5 flex flex-wrap items-center gap-2">
					{Object.entries(tags).map(([group, groupTags]) => (
						<CategoryDropdown
							key={group}
							label={group}
							tags={groupTags}
							selectedSlugs={selectedSlugs}
							onToggle={handleToggle}
						/>
					))}
					{selectedSlugs.length > 0 && (
						<button
							type="button"
							className="text-sm text-sun-text hover:underline"
							onClick={() => navigate({ search: {} })}
						>
							Clear filters
						</button>
					)}
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
						<div className={cn("grid gap-4", gridLayoutClasses[gridLayout])}>
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
							basePath="/apps"
							searchParams={searchParams}
						/>
					</>
				)}
			</div>
		</PageLayout>
	);
}

function CategoryDropdown({
	label,
	tags,
	selectedSlugs,
	onToggle,
}: {
	label: string;
	tags: Array<{ name: string; slug: string }>;
	selectedSlugs: string[];
	onToggle: (slug: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const activeCount = tags.filter((t) => selectedSlugs.includes(t.slug)).length;

	return (
		<div className="relative">
			<button
				type="button"
				className={cn(
					"inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
					activeCount > 0
						? "border-sun-border bg-sun-subtle text-sun-text"
						: "border-border bg-card text-foreground hover:border-sun-border",
				)}
				onClick={() => setOpen(!open)}
			>
				<span className="capitalize">{label}</span>
				{activeCount > 0 && (
					<span className="flex size-4 items-center justify-center rounded-full bg-sun text-[10px] font-bold text-background">
						{activeCount}
					</span>
				)}
				<svg
					viewBox="0 0 12 12"
					className={cn("size-3 transition-transform", open && "rotate-180")}
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						d="M2.5 4.5L6 8L9.5 4.5"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="none"
					/>
				</svg>
			</button>

			{open && (
				<>
					{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss overlay */}
					<div
						role="presentation"
						className="fixed inset-0 z-40"
						onClick={() => setOpen(false)}
					/>
					<div className="absolute left-0 z-50 mt-1 max-h-64 w-48 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
						{tags.map((tag) => {
							const isActive = selectedSlugs.includes(tag.slug);
							return (
								<button
									key={tag.slug}
									type="button"
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
										isActive
											? "bg-sun-subtle text-sun-text"
											: "text-foreground hover:bg-muted",
									)}
									onClick={() => onToggle(tag.slug)}
								>
									<span
										className={cn(
											"flex size-3.5 shrink-0 items-center justify-center rounded border text-[10px]",
											isActive
												? "border-sun bg-sun text-background"
												: "border-border",
										)}
									>
										{isActive && "✓"}
									</span>
									{tag.name}
								</button>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
}
