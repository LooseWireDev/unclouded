import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

interface SearchBarProps {
	defaultValue?: string;
	placeholder?: string;
	size?: "default" | "lg";
}

export function SearchBar({
	defaultValue = "",
	placeholder = "Search privacy-friendly apps...",
	size = "default",
}: SearchBarProps) {
	const navigate = useNavigate();
	const isLoading = useRouterState({
		select: (s) => s.status === "pending",
	});
	const [query, setQuery] = useState(defaultValue);

	useEffect(() => {
		setQuery(defaultValue);
	}, [defaultValue]);

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const trimmed = query.trim();
		if (trimmed) {
			navigate({ to: "/search", search: { q: trimmed } });
		}
	}

	const isLarge = size === "lg";

	return (
		<form
			onSubmit={handleSubmit}
			className="relative flex w-full items-center gap-2"
		>
			<div className="relative flex-1">
				<HugeiconsIcon
					icon={Search01Icon}
					className={cn(
						"absolute top-1/2 -translate-y-1/2 text-muted-foreground",
						isLarge ? "left-4 size-5" : "left-3 size-4",
					)}
					strokeWidth={2}
				/>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={placeholder}
					className={cn(
						"w-full rounded-4xl border border-input bg-input/30 text-foreground transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/50 focus:outline-none",
						isLarge ? "h-12 pl-11 pr-4 text-base" : "h-9 pl-9 pr-3 text-sm",
					)}
				/>
			</div>
			<button
				type="submit"
				disabled={isLoading}
				className={cn(
					"flex shrink-0 items-center justify-center gap-2 rounded-4xl bg-sun-bg font-medium text-sun-text transition-colors hover:bg-sun-bg/80 disabled:opacity-70",
					isLarge ? "h-12 px-6 text-base" : "h-9 px-4 text-sm",
				)}
			>
				{isLoading ? (
					<>
						<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						Searching…
					</>
				) : (
					"Search"
				)}
			</button>
		</form>
	);
}
