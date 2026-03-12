/**
 * Generate a proxied icon URL that routes through our /icon endpoint
 * for Cloudflare edge caching.
 */
export function getIconUrl(rawUrl: string): string {
	return `/icon?url=${encodeURIComponent(rawUrl)}`;
}
