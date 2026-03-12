import { Link } from "@tanstack/react-router";
import { JsonLd } from "~/components/json-ld";
import { SITE_URL } from "~/lib/constants";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.label,
			...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
		})),
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<nav
				aria-label="Breadcrumb"
				className="mb-4 font-mono text-[11px] tracking-wider text-muted-foreground"
			>
				<ol className="flex flex-wrap items-center gap-1">
					{items.map((item, index) => {
						const isLast = index === items.length - 1;
						return (
							<li key={item.label} className="flex items-center gap-1">
								{index > 0 && (
									<span aria-hidden="true" className="text-border">
										/
									</span>
								)}
								{isLast || !item.href ? (
									<span aria-current={isLast ? "page" : undefined}>
										{item.label}
									</span>
								) : (
									<Link
										to={item.href}
										className="transition-colors hover:text-foreground"
									>
										{item.label}
									</Link>
								)}
							</li>
						);
					})}
				</ol>
			</nav>
		</>
	);
}
