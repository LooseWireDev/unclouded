// ═══════════════════════════════════════════════════════════════════
// db/client.ts
// Turso + Drizzle client initialization.
// Exports both the Drizzle ORM instance and the raw Turso client
// (needed for vector queries that Drizzle can't express).
// ═══════════════════════════════════════════════════════════════════

import { type Client, createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type TursoClient = Client;
export type DrizzleDB = ReturnType<typeof createDrizzle>;

function createDrizzle(client: Client) {
	return drizzle(client, { schema });
}

// Singleton — reused across server function invocations within
// the same Workers isolate. New isolates get a new connection.
let _client: Client | null = null;
let _db: DrizzleDB | null = null;

// Workerd's native fetch doesn't accept cross-fetch's Request polyfill.
// Extract URL + init from the Request object so native fetch works.
function workerFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	if (typeof input === "object" && "url" in input) {
		const req = input as Request;
		return globalThis.fetch(req.url, {
			method: req.method,
			headers: req.headers,
			body: req.body,
		});
	}
	return globalThis.fetch(input, init);
}

export function getTursoClient(): TursoClient {
	if (!_client) {
		_client = createClient({
			url: process.env.TURSO_DATABASE_URL!,
			authToken: process.env.TURSO_AUTH_TOKEN!,
			fetch: workerFetch,
		});
	}
	return _client;
}

export function getDb(): DrizzleDB {
	if (!_db) {
		_db = createDrizzle(getTursoClient());
	}
	return _db;
}
