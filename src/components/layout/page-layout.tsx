import type { ReactNode } from "react";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";

interface PageLayoutProps {
	children: ReactNode;
	sidebar?: ReactNode;
}

export function PageLayout({ children, sidebar }: PageLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
				{sidebar && (
					<aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>
				)}
				<main className="min-w-0 flex-1">{children}</main>
			</div>
			<SiteFooter />
		</div>
	);
}
