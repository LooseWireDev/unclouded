import { cn } from "~/lib/utils";

export type GridLayout = "list" | "2" | "3" | "4";

const layouts: { value: GridLayout; label: string; icon: React.ReactNode }[] = [
	{
		value: "list",
		label: "List",
		icon: (
			<svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
				<rect x="0" y="1" width="16" height="3" rx="0.5" />
				<rect x="0" y="6.5" width="16" height="3" rx="0.5" />
				<rect x="0" y="12" width="16" height="3" rx="0.5" />
			</svg>
		),
	},
	{
		value: "2",
		label: "2 columns",
		icon: (
			<svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
				<rect x="0" y="0" width="7" height="7" rx="1" />
				<rect x="9" y="0" width="7" height="7" rx="1" />
				<rect x="0" y="9" width="7" height="7" rx="1" />
				<rect x="9" y="9" width="7" height="7" rx="1" />
			</svg>
		),
	},
	{
		value: "3",
		label: "3 columns",
		icon: (
			<svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
				<rect x="0" y="0" width="4.3" height="7" rx="0.7" />
				<rect x="5.8" y="0" width="4.3" height="7" rx="0.7" />
				<rect x="11.7" y="0" width="4.3" height="7" rx="0.7" />
				<rect x="0" y="9" width="4.3" height="7" rx="0.7" />
				<rect x="5.8" y="9" width="4.3" height="7" rx="0.7" />
				<rect x="11.7" y="9" width="4.3" height="7" rx="0.7" />
			</svg>
		),
	},
	{
		value: "4",
		label: "4 columns",
		icon: (
			<svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
				<rect x="0" y="0" width="3" height="7" rx="0.5" />
				<rect x="4.3" y="0" width="3" height="7" rx="0.5" />
				<rect x="8.6" y="0" width="3" height="7" rx="0.5" />
				<rect x="13" y="0" width="3" height="7" rx="0.5" />
				<rect x="0" y="9" width="3" height="7" rx="0.5" />
				<rect x="4.3" y="9" width="3" height="7" rx="0.5" />
				<rect x="8.6" y="9" width="3" height="7" rx="0.5" />
				<rect x="13" y="9" width="3" height="7" rx="0.5" />
			</svg>
		),
	},
];

interface GridLayoutSwitcherProps {
	value: GridLayout;
	onChange: (layout: GridLayout) => void;
}

export function GridLayoutSwitcher({
	value,
	onChange,
}: GridLayoutSwitcherProps) {
	return (
		<div className="flex items-center rounded-md border border-border bg-muted/50 p-0.5">
			{layouts.map((layout) => (
				<button
					key={layout.value}
					type="button"
					title={layout.label}
					className={cn(
						"flex items-center justify-center rounded-sm p-1.5 transition-colors",
						value === layout.value
							? "bg-card text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground",
					)}
					onClick={() => onChange(layout.value)}
				>
					{layout.icon}
				</button>
			))}
		</div>
	);
}

export const gridLayoutClasses: Record<GridLayout, string> = {
	list: "grid-cols-1",
	"2": "grid-cols-1 sm:grid-cols-2",
	"3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	"4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};
