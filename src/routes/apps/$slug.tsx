import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppDetailHeader } from "~/components/app-detail-header";
import { InstallSources } from "~/components/install-sources";
import { PageLayout } from "~/components/layout/page-layout";
import { TagPill } from "~/components/tag-pill";
import { fetchAppAlternatives, fetchAppBySlug } from "~/lib/server-fns";

export const Route = createFileRoute("/apps/$slug")({
	loader: async ({ params }) => {
		const app = await fetchAppBySlug({ data: { slug: params.slug } });
		if (!app) throw notFound();

		const alternatives = await fetchAppAlternatives({
			data: { appId: app.id },
		});

		return { app, alternatives };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { app } = loaderData;
		return {
			meta: [
				{ title: `${app.name} — Unclouded` },
				{
					name: "description",
					content:
						app.description ?? `${app.name} — privacy-focused alternative`,
				},
				{ property: "og:title", content: `${app.name} — Unclouded` },
				{
					property: "og:description",
					content:
						app.description ?? `${app.name} — privacy-focused alternative`,
				},
			],
		};
	},
	component: AppDetailPage,
});

function AppDetailPage() {
	const { app, alternatives } = Route.useLoaderData();

	return (
		<PageLayout>
			<div className="mx-auto max-w-2xl space-y-10">
				<AppDetailHeader
					name={app.name}
					slug={app.slug}
					description={app.description}
					iconUrl={app.iconUrl}
					license={app.license}
					websiteUrl={app.websiteUrl}
					repositoryUrl={app.repositoryUrl}
				/>

				{app.tags.length > 0 && (
					<section>
						<h2 className="mb-3 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
							Tags
						</h2>
						<div className="flex flex-wrap gap-2">
							{app.tags.map(
								(tag: { name: string; slug: string; type: string }) => (
									<TagPill
										key={tag.slug}
										name={tag.name}
										slug={tag.slug}
										type={tag.type as "category" | "feature" | "platform"}
									/>
								),
							)}
						</div>
					</section>
				)}

				{app.sources.length > 0 && (
					<InstallSources sources={app.sources} appName={app.name} />
				)}

				{alternatives.length > 0 && (
					<section>
						<h2 className="mb-3 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
							Replaces
						</h2>
						<div className="space-y-3">
							{alternatives.map((alt) => (
								<a
									key={alt.proprietaryApp.id}
									href={`/alternatives/${alt.proprietaryApp.slug}`}
									className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-sun-border"
								>
									<div className="flex items-center gap-3">
										{alt.proprietaryApp.iconUrl ? (
											<img
												src={alt.proprietaryApp.iconUrl}
												alt=""
												className="size-8 shrink-0 rounded-md object-cover"
												loading="lazy"
											/>
										) : (
											<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
												{alt.proprietaryApp.name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="font-medium text-foreground">
												{alt.proprietaryApp.name}
											</p>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span className="capitalize">
													{alt.relationshipType} replacement
												</span>
												{alt.notes && (
													<>
														<span>·</span>
														<span>{alt.notes}</span>
													</>
												)}
											</div>
										</div>
									</div>
								</a>
							))}
						</div>
					</section>
				)}
			</div>
		</PageLayout>
	);
}
