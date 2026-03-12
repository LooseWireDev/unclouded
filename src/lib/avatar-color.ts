/**
 * Generate a consistent HSL background color from a string (app name).
 * Uses a simple hash → hue mapping so each app gets a distinct color.
 */
function hashName(name: string): number {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return Math.abs(hash) % 360;
}

export function avatarColorFromName(name: string): string {
	const hue = hashName(name);
	return `hsl(${hue}, 50%, 30%)`;
}

export function avatarTextColorFromName(name: string): string {
	const hue = hashName(name);
	return `hsl(${hue}, 60%, 78%)`;
}
