import { cn } from "~/lib/utils";

interface HtmlDescriptionProps {
	html: string;
	className?: string;
}

export function HtmlDescription({ html, className }: HtmlDescriptionProps) {
	return (
		<div
			className={cn(
				"prose-description text-sm leading-relaxed text-muted-foreground [&_a]:text-sun-accent [&_a]:underline [&_a:hover]:text-sun-text [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1",
				className,
			)}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
