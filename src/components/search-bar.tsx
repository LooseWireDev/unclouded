import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		setQuery(defaultValue);
	}, [defaultValue]);

	function navigateToSearch(value: string) {
		const trimmed = value.trim();
		if (trimmed) {
			navigate({ to: "/search", search: { q: trimmed } });
		}
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.target.value;
		setQuery(value);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		debounceRef.current = setTimeout(() => {
			navigateToSearch(value);
		}, 300);
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		navigateToSearch(query);
	}

	const isLarge = size === "lg";

	return (
		<form onSubmit={handleSubmit} className="relative w-full">
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
				onChange={handleChange}
				placeholder={placeholder}
				className={cn(
					"w-full rounded-4xl border border-input bg-input/30 text-foreground transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/50 focus:outline-none",
					isLarge ? "h-12 pl-11 pr-4 text-base" : "h-9 pl-9 pr-3 text-sm",
				)}
			/>
		</form>
	);
}
