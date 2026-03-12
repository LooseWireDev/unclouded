import {
	Moon02Icon,
	MoonEclipseIcon,
	Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Theme = "system" | "light" | "dark";

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	return (localStorage.getItem("unclouded-theme") as Theme) ?? "system";
}

function applyTheme(theme: Theme) {
	const resolved =
		theme === "system"
			? window.matchMedia("(prefers-color-scheme: light)").matches
				? "light"
				: "dark"
			: theme;

	if (resolved === "light") {
		document.documentElement.setAttribute("data-theme", "light");
		document.documentElement.classList.remove("dark");
	} else {
		document.documentElement.removeAttribute("data-theme");
		document.documentElement.classList.add("dark");
	}
}

const options = [
	{ value: "system" as const, label: "System", icon: MoonEclipseIcon },
	{ value: "light" as const, label: "Light", icon: Sun03Icon },
	{ value: "dark" as const, label: "Dark", icon: Moon02Icon },
];

export function ThemeSwitcher() {
	const [theme, setTheme] = useState<Theme>(getStoredTheme);
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	// Apply theme whenever it changes and persist
	useEffect(() => {
		applyTheme(theme);
		localStorage.setItem("unclouded-theme", theme);
	}, [theme]);

	// Re-apply on mount (handles SSR hydration mismatch)
	useEffect(() => {
		const stored = getStoredTheme();
		setTheme(stored);
		applyTheme(stored);
	}, []);

	// Listen for system theme changes
	useEffect(() => {
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: light)");
		const handler = () => applyTheme("system");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	// Close dropdown on outside click
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	const handleSelect = useCallback((value: Theme) => {
		setTheme(value);
		setOpen(false);
	}, []);

	const currentIcon =
		theme === "light"
			? Sun03Icon
			: theme === "dark"
				? Moon02Icon
				: MoonEclipseIcon;

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Switch theme"
			>
				<HugeiconsIcon icon={currentIcon} className="size-4" strokeWidth={2} />
			</button>

			{open && (
				<div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-border bg-popover p-1 shadow-lg">
					{options.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => handleSelect(opt.value)}
							className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
								theme === opt.value
									? "bg-accent text-accent-foreground"
									: "text-popover-foreground hover:bg-muted"
							}`}
						>
							<HugeiconsIcon
								icon={opt.icon}
								className="size-3.5"
								strokeWidth={2}
							/>
							{opt.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
