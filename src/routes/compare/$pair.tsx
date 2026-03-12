import {
	Cancel01Icon,
	CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppAvatar } from "~/components/app-avatar";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import { SourceBadge } from "~/components/source-badge";
import { SITE_URL } from "~/lib/constants";
import { fetchComparisonBySlug } from "~/lib/server-fns";
import { stripHtml } from "~/lib/strip-html";

export const Route = createFileRoute("/compare/$pair")({
	loader: async ({ params }) => {
		const comparison = await fetchComparisonBySlug({
			data: { slug: params.pair },
		});
		if (!comparison) throw notFound();
		return { comparison };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { comparison } = loaderData;
		const title = `${comparison.appA.name} vs ${comparison.appB.name} — Unclouded`;
		const description = `Compare ${comparison.appA.name} and ${comparison.appB.name}: features, platforms, privacy. Find the right open source alternative.`;
		const canonical = `${SITE_URL}/compare/${comparison.slug}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				...(comparison.appA.iconUrl
					? [{ property: "og:image", content: comparison.appA.iconUrl }]
					: []),
			],
			links: [{ rel: "canonical", href: canonical }],
		};
	},
	component: ComparisonPage,
});

function AppIcon({ iconUrl, name }: { iconUrl?: string | null; name: string }) {
	return <AppAvatar iconUrl={iconUrl} name={name} />;
}

type AppData = {
	name: string;
	slug: string;
	description: string | null;
	iconUrl: string | null;
	license: string | null;
	websiteUrl: string | null;
	repositoryUrl: string | null;
	sources: Array<{ source: string; url: string }>;
	tags: Array<{ id: string; name: string; slug: string; type: string }>;
};

function BoolCell({ value }: { value: boolean }) {
	return value ? (
		<HugeiconsIcon
			icon={CheckmarkCircle02Icon}
			className="size-4 text-success"
			strokeWidth={2}
		/>
	) : (
		<HugeiconsIcon
			icon={Cancel01Icon}
			className="size-4 text-text-dim"
			strokeWidth={2}
		/>
	);
}

function TagCells({ tagsA, tagsB }: { tagsA: string[]; tagsB: string[] }) {
	const all = [...new Set([...tagsA, ...tagsB])];
	if (all.length === 0) return null;

	return (
		<>
			<td className="px-3 py-2">
				<div className="flex flex-wrap gap-1">
					{tagsA.map((t) => (
						<span
							key={t}
							className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
						>
							{t}
						</span>
					))}
					{tagsA.length === 0 && (
						<span className="text-xs text-text-dim">—</span>
					)}
				</div>
			</td>
			<td className="px-3 py-2">
				<div className="flex flex-wrap gap-1">
					{tagsB.map((t) => (
						<span
							key={t}
							className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
						>
							{t}
						</span>
					))}
					{tagsB.length === 0 && (
						<span className="text-xs text-text-dim">—</span>
					)}
				</div>
			</td>
		</>
	);
}

function getTagsByType(tags: AppData["tags"], type: string) {
	return tags.filter((t) => t.type === type).map((t) => t.name);
}

function ComparisonPage() {
	const { comparison } = Route.useLoaderData();
	const { appA, appB } = comparison;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `${appA.name} vs ${appB.name}`,
		numberOfItems: 2,
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				url: `${SITE_URL}/apps/${appA.slug}`,
				name: appA.name,
			},
			{
				"@type": "ListItem",
				position: 2,
				url: `${SITE_URL}/apps/${appB.slug}`,
				name: appB.name,
			},
		],
	};

	const rows = buildComparisonRows(appA, appB);

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div className="mx-auto max-w-4xl space-y-6">
				<div>
					<Breadcrumb
						items={[
							{ label: "Home", href: "/" },
							{ label: "Compare" },
							{ label: `${appA.name} vs ${appB.name}` },
						]}
					/>
					<div className="text-center">
						<h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
							{appA.name} vs {appB.name}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Side-by-side comparison of two open source alternatives
						</p>
					</div>
				</div>

				{/* Compact app headers */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{[appA, appB].map((app) => (
						<Link
							key={app.slug}
							to="/apps/$slug"
							params={{ slug: app.slug }}
							className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-sun-border"
						>
							<AppIcon iconUrl={app.iconUrl} name={app.name} />
							<div className="min-w-0 flex-1">
								<h2 className="font-sans text-base font-bold text-foreground group-hover:text-primary">
									{app.name}
								</h2>
								{app.description && (
									<p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
										{stripHtml(app.description)}
									</p>
								)}
							</div>
						</Link>
					))}
				</div>

				{/* Feature comparison matrix */}
				<div className="overflow-x-auto rounded-lg border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/50">
								<th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
									Feature
								</th>
								<th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
									{appA.name}
								</th>
								<th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
									{appB.name}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{rows.map((row) => (
								<tr key={row.label}>
									<td className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
										{row.label}
									</td>
									{row.type === "boolean" ? (
										<>
											<td className="px-3 py-2">
												<BoolCell value={row.a as boolean} />
											</td>
											<td className="px-3 py-2">
												<BoolCell value={row.b as boolean} />
											</td>
										</>
									) : row.type === "text" ? (
										<>
											<td className="px-3 py-2 text-foreground">
												{(row.a as string) || (
													<span className="text-text-dim">—</span>
												)}
											</td>
											<td className="px-3 py-2 text-foreground">
												{(row.b as string) || (
													<span className="text-text-dim">—</span>
												)}
											</td>
										</>
									) : row.type === "sources" ? (
										<>
											<td className="px-3 py-2">
												<div className="flex flex-wrap gap-1">
													{(
														row.a as Array<{ source: string; url: string }>
													).map((s) => (
														<SourceBadge
															key={s.source}
															source={s.source}
															url={s.url}
														/>
													))}
												</div>
											</td>
											<td className="px-3 py-2">
												<div className="flex flex-wrap gap-1">
													{(
														row.b as Array<{ source: string; url: string }>
													).map((s) => (
														<SourceBadge
															key={s.source}
															source={s.source}
															url={s.url}
														/>
													))}
												</div>
											</td>
										</>
									) : (
										<TagCells
											tagsA={row.a as string[]}
											tagsB={row.b as string[]}
										/>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Links */}
				<div className="flex flex-wrap gap-3">
					<Link
						to="/apps/$slug"
						params={{ slug: appA.slug }}
						className="text-sm font-medium text-sun-text hover:text-primary"
					>
						View {appA.name} details
					</Link>
					<span className="text-muted-foreground">·</span>
					<Link
						to="/apps/$slug"
						params={{ slug: appB.slug }}
						className="text-sm font-medium text-sun-text hover:text-primary"
					>
						View {appB.name} details
					</Link>
				</div>
			</div>
		</PageLayout>
	);
}

type ComparisonRow =
	| { label: string; type: "boolean"; a: boolean; b: boolean }
	| { label: string; type: "text"; a: string; b: string }
	| { label: string; type: "tags"; a: string[]; b: string[] }
	| {
			label: string;
			type: "sources";
			a: AppData["sources"];
			b: AppData["sources"];
	  };

function buildComparisonRows(appA: AppData, appB: AppData): ComparisonRow[] {
	const rows: ComparisonRow[] = [];

	rows.push({
		label: "License",
		type: "text",
		a: appA.license ?? "Unknown",
		b: appB.license ?? "Unknown",
	});

	rows.push({
		label: "Install sources",
		type: "sources",
		a: appA.sources,
		b: appB.sources,
	});

	const categoriesA = getTagsByType(appA.tags, "category");
	const categoriesB = getTagsByType(appB.tags, "category");
	if (categoriesA.length > 0 || categoriesB.length > 0) {
		rows.push({
			label: "Categories",
			type: "tags",
			a: categoriesA,
			b: categoriesB,
		});
	}

	const featuresA = getTagsByType(appA.tags, "feature");
	const featuresB = getTagsByType(appB.tags, "feature");
	if (featuresA.length > 0 || featuresB.length > 0) {
		rows.push({ label: "Features", type: "tags", a: featuresA, b: featuresB });
	}

	const compatA = getTagsByType(appA.tags, "compatibility");
	const compatB = getTagsByType(appB.tags, "compatibility");
	if (compatA.length > 0 || compatB.length > 0) {
		rows.push({ label: "Compatibility", type: "tags", a: compatA, b: compatB });
	}

	const platformsA = getTagsByType(appA.tags, "platform");
	const platformsB = getTagsByType(appB.tags, "platform");
	if (platformsA.length > 0 || platformsB.length > 0) {
		rows.push({
			label: "Platforms",
			type: "tags",
			a: platformsA,
			b: platformsB,
		});
	}

	rows.push({
		label: "Website",
		type: "boolean",
		a: !!appA.websiteUrl,
		b: !!appB.websiteUrl,
	});

	rows.push({
		label: "Source code",
		type: "boolean",
		a: !!appA.repositoryUrl,
		b: !!appB.repositoryUrl,
	});

	return rows;
}
