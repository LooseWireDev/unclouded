import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

interface PaginationProps {
	currentPage: number;
	hasMore: boolean;
	basePath: string;
	searchParams?: Record<string, string | number>;
	params?: Record<string, string>;
}

export function Pagination({
	currentPage,
	hasMore,
	basePath,
	searchParams = {},
	params,
}: PaginationProps) {
	function buildSearch(page: number) {
		const search: Record<string, string | number> = { ...searchParams };
		if (page > 1) {
			search.page = page;
		} else {
			delete search.page;
		}
		return search;
	}

	// basePath is dynamic — routes are registered when route files are created
	const to = basePath as "/";
	const linkParams = params ?? {};

	return (
		<div className="flex items-center justify-center gap-4 pt-6">
			{currentPage > 1 ? (
				<Link to={to} search={buildSearch(currentPage - 1)} params={linkParams}>
					<Button variant="outline" size="sm">
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							data-icon="inline-start"
							strokeWidth={2}
						/>
						Previous
					</Button>
				</Link>
			) : (
				<Button variant="outline" size="sm" disabled>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						data-icon="inline-start"
						strokeWidth={2}
					/>
					Previous
				</Button>
			)}

			<span className="text-sm text-muted-foreground">Page {currentPage}</span>

			{hasMore ? (
				<Link to={to} search={buildSearch(currentPage + 1)} params={linkParams}>
					<Button variant="outline" size="sm">
						Next
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							data-icon="inline-end"
							strokeWidth={2}
						/>
					</Button>
				</Link>
			) : (
				<Button variant="outline" size="sm" disabled>
					Next
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						data-icon="inline-end"
						strokeWidth={2}
					/>
				</Button>
			)}
		</div>
	);
}
