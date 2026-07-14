import type { Client } from "@libsql/client";

// Desktop-only = has at least one desktop platform tag but NO mobile
// tag — the same predicate the old desktopOnlyAppIds subquery in
// db/queries.ts evaluated per request. Computed once here instead, so
// list queries filter on apps.desktop_only rather than re-scanning the
// whole app_tags join.
export async function updateDesktopOnlyFlags(client: Client) {
	await client.execute(`
		UPDATE apps SET desktop_only = (
			EXISTS (
				SELECT 1 FROM app_tags at
				JOIN tags t ON t.id = at.tag_id
				WHERE at.app_id = apps.id
					AND t.slug IN ('desktop', 'linux', 'macos', 'windows')
			)
			AND NOT EXISTS (
				SELECT 1 FROM app_tags at
				JOIN tags t ON t.id = at.tag_id
				WHERE at.app_id = apps.id
					AND t.slug IN ('android', 'ios')
			)
		)
	`);
	const result = await client.execute(
		"SELECT COUNT(*) AS total FROM apps WHERE desktop_only = 1",
	);
	return Number(result.rows[0].total);
}
