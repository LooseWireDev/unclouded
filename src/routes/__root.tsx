import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import "~/styles/globals.css";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Unclouded" },
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

const themeScript = `(function(){try{var t=localStorage.getItem('unclouded-theme')||'system';var r=t==='system'?window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark':t;if(r==='light'){document.documentElement.setAttribute('data-theme','light');document.documentElement.classList.remove('dark')}else{document.documentElement.removeAttribute('data-theme');document.documentElement.classList.add('dark')}}catch(e){}})()`;

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline script needed to prevent flash of wrong theme */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
