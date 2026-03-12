import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
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
				className={cn(
					"shrink-0 rounded-4xl bg-sun-bg font-medium text-sun-text transition-colors hover:bg-sun-bg/80",
					isLarge ? "h-12 px-6 text-base" : "h-9 px-4 text-sm",
				)}
			>
				Search
			</button>
		</form>
	);
}
