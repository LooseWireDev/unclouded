import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumb } from "~/components/breadcrumb";
import { JsonLd } from "~/components/json-ld";
import { PageLayout } from "~/components/layout/page-layout";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { SITE_URL } from "~/lib/constants";
import { fetchLicenses } from "~/lib/server-fns";

export const Route = createFileRoute("/license/")({
	loader: async () => {
		const licenses = await fetchLicenses();
		return { licenses };
	},
	head: () => ({
		meta: [
			{ title: "Open Source Licenses — Unclouded" },
			{
				name: "description",
				content:
					"Browse open source apps by license type. Find GPL, MIT, Apache, and other licensed privacy apps.",
			},
			{ property: "og:title", content: "Open Source Licenses — Unclouded" },
			{
				property: "og:description",
				content:
					"Browse open source apps by license type. Find GPL, MIT, Apache, and other licensed privacy apps.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/license` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/license` }],
	}),
	component: LicenseIndexPage,
});

function LicenseIndexPage() {
	const { licenses } = Route.useLoaderData();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "Open Source Licenses",
		url: `${SITE_URL}/license`,
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: licenses.length,
			itemListElement: licenses.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: `${SITE_URL}/license/${encodeURIComponent(item.license!)}`,
				name: item.license,
			})),
		},
	};

	return (
		<PageLayout>
			<JsonLd data={jsonLd} />
			<div>
				<div className="mb-6">
					<Breadcrumb
						items={[{ label: "Home", href: "/" }, { label: "Licenses" }]}
					/>
					<h1 className="font-display text-2xl font-semibold text-foreground">
						Licenses
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Browse apps by open source license
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					{licenses.map((item) => (
						<Link
							key={item.license}
							to="/license/$license"
							params={{ license: item.license! }}
							className="group"
						>
							<Card
								size="sm"
								className="transition-all group-hover:border-sun-border"
							>
								<CardHeader>
									<CardTitle className="text-sm">{item.license}</CardTitle>
									<CardDescription>{item.count} apps</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</PageLayout>
	);
}
