import { cn } from "~/lib/utils";

interface TagPillProps {
	name: string;
	slug: string;
	type?: "category" | "feature" | "platform";
	interactive?: boolean;
	onClick?: () => void;
	className?: string;
}

export function TagPill({
	name,
	slug,
	type = "category",
	interactive,
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

	return (
		<span data-slug={slug} className={cn(base, typeStyles, className)}>
			{name}
		</span>
	);
}
