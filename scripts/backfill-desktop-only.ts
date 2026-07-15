import "dotenv/config";
import { createClient } from "@libsql/client";
import { updateDesktopOnlyFlags } from "../db/seed/lib/desktop-only";

// One-off backfill for the apps.desktop_only column on an existing
// database. Run `pnpm db:push` first so the column exists. Subsequent
// reseeds keep the flag current via seed:import.

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
	console.error(
		"Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables",
	);
	process.exit(1);
}

const client = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

const total = await updateDesktopOnlyFlags(client);
console.log(`${total} desktop-only apps flagged`);
client.close();
