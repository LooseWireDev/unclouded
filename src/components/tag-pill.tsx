import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

interface TagPillProps {
	name: string;
	slug: string;
	type?: "category" | "feature" | "platform";
	interactive?: boolean;
	linked?: boolean;
	onClick?: () => void;
	className?: string;
}

export function TagPill({
	name,
	slug,
	type = "category",
	interactive,
	linked,
	onClick,
	className,
}: TagPillProps) {
	const base =
		"inline-flex h-6 items-center rounded-4xl px-2.5 text-xs font-medium transition-colors";
	const typeStyles =
		type === "feature"
			? "bg-accent text-accent-foreground"
			: "bg-muted text-muted-foreground";

	if (interactive) {
		return (
			<button
				type="button"
				onClick={onClick}
				data-slug={slug}
				className={cn(
					base,
					typeStyles,
					"cursor-pointer hover:text-foreground",
					className,
				)}
			>
				{name}
			</button>
		);
	}

	if (linked) {
		const to =
			type === "category"
				? ("/category/$slug" as const)
				: ("/tags/$type/$slug" as const);
		const params = type === "category" ? { slug } : { type, slug };

		return (
			<Link
				to={to}
				params={params}
				className={cn(base, typeStyles, "hover:text-foreground", className)}
			>
				{name}
			</Link>
		);
	}

	return (
		<span data-slug={slug} className={cn(base, typeStyles, className)}>
			{name}
		</span>
	);
}
