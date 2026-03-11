import { createFileRoute, notFound } from "@tanstack/react-router";
import { AlternativeCard } from "~/components/alternative-card";
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
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `Alternatives to ${loaderData.propApp.name} — Unclouded`
					: "Alternatives — Unclouded",
			},
			...(loaderData?.propApp.description
				? [
						{
							name: "description",
							content: `Open source alternatives to ${loaderData.propApp.name}: ${loaderData.propApp.description}`,
						},
					]
				: []),
		],
	}),
	component: AlternativeDetailPage,
});

function AlternativeDetailPage() {
	const { propApp, alternatives } = Route.useLoaderData();

	return (
		<div className="space-y-8">
			<div className="flex items-start gap-4">
				{propApp.iconUrl ? (
					<img
						src={propApp.iconUrl}
						alt=""
						className="size-14 shrink-0 rounded-xl object-cover"
					/>
				) : (
					<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-semibold text-muted-foreground">
						{propApp.name.charAt(0).toUpperCase()}
					</div>
				)}
				<div>
					<h1 className="font-display text-[26px] font-semibold">
						Alternatives to {propApp.name}
					</h1>
					{propApp.description && (
						<p className="mt-1 text-muted-foreground">{propApp.description}</p>
					)}
				</div>
			</div>

			<section>
				<h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
					Open Source Alternatives
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
		</div>
	);
}
