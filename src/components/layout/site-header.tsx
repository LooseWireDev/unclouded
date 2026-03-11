import { Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";

const navLinks = [
	{ label: "Apps", href: "/apps" },
	{ label: "Alternatives", href: "/alternatives" },
	{ label: "Discover", href: "/discover" },
] as const;

function Logo() {
	return (
		<Link to="/" className="flex items-baseline gap-0">
			<span className="font-display text-xl italic text-primary">un</span>
			<span className="font-display text-xl font-bold text-foreground">
				clouded
			</span>
		</Link>
	);
}

function HeaderSearchForm() {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const trimmed = query.trim();
		if (trimmed) {
			navigate({ to: "/search", search: { q: trimmed } });
		}
	}

	return (
		<form onSubmit={handleSubmit} className="relative hidden md:block">
			<HugeiconsIcon
				icon={Search01Icon}
				className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
				strokeWidth={2}
			/>
			<input
				type="text"
				placeholder="Search apps..."
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				className="h-8 w-48 rounded-4xl border border-input bg-input/30 pl-8 pr-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:w-64 focus:border-ring focus:ring-[3px] focus:ring-ring/50 focus:outline-none lg:w-56"
			/>
		</form>
	);
}

export function SiteHeader() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<div className="flex items-center gap-8">
					<Logo />
					<nav className="hidden items-center gap-6 md:flex">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								to={link.href}
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-sun-text"
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				<div className="flex items-center gap-2">
					<HeaderSearchForm />

					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger
							render={
								<Button variant="ghost" size="icon-sm" className="md:hidden" />
							}
						>
							<HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
							<span className="sr-only">Menu</span>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>
									<Logo />
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-4 px-6 pt-4">
								{navLinks.map((link) => (
									<Link
										key={link.href}
										to={link.href}
										className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
										onClick={() => setMobileOpen(false)}
									>
										{link.label}
									</Link>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
