import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: ["p", "b", "i", "strong", "em", "a", "ul", "ol", "li", "br"],
	allowedAttributes: {
		a: ["href"],
	},
	transformTags: {
		a: sanitizeHtml.simpleTransform("a", {
			rel: "nofollow noopener",
			target: "_blank",
		}),
	},
};

export function sanitizeDescription(html: string): string {
	return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
