export function JsonLd({ data }: { data: Record<string, unknown> }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must use innerHTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}
