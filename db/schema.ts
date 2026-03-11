import { relations } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── Helpers ────────────────────────────────────────────────────────

const timestamps = {
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
};

// ─── Apps ───────────────────────────────────────────────────────────
// Privacy-respecting / open source apps — the things people switch TO

export const apps = sqliteTable("apps", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	iconUrl: text("icon_url"),
	license: text("license"), // e.g. "GPL-3.0", "MIT", "Apache-2.0"
	websiteUrl: text("website_url"),
	repositoryUrl: text("repository_url"),
	...timestamps,
});

export const appsRelations = relations(apps, ({ many }) => ({
	sources: many(appSources),
	tags: many(appTags),
	alternatives: many(alternatives),
}));

// ─── App Sources ────────────────────────────────────────────────────
// Where to install the app from — one app, multiple sources

export type SourceType =
	| "fdroid"
	| "izzyondroid"
	| "github"
	| "play_store"
	| "obtainium"
	| "direct"; // APK from website, etc.

export type AppSourceMetadata = {
	apkFilterRegex?: string;
	preferred?: boolean;
	additionalSettings?: Record<string, unknown>;
};

export const appSources = sqliteTable(
	"app_sources",
	{
		id: text("id").primaryKey(),
		appId: text("app_id")
			.notNull()
			.references(() => apps.id, { onDelete: "cascade" }),
		source: text("source").$type<SourceType>().notNull(),
		url: text("url").notNull(),
		packageName: text("package_name"), // e.g. "org.thoughtcrime.securesms"
		metadata: text("metadata", {
			mode: "json",
		}).$type<AppSourceMetadata | null>(),
	},
	(table) => ({
		uniqueSource: uniqueIndex("app_source_unique").on(
			table.appId,
			table.source,
		),
	}),
);

export const appSourcesRelations = relations(appSources, ({ one }) => ({
	app: one(apps, {
		fields: [appSources.appId],
		references: [apps.id],
	}),
}));

// ─── Proprietary Apps ───────────────────────────────────────────────
// The things people are replacing — WhatsApp, Google Maps, etc.

export const proprietaryApps = sqliteTable("proprietary_apps", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	iconUrl: text("icon_url"),
	websiteUrl: text("website_url"),
	packageName: text("package_name"), // for mobile scanner matching
	...timestamps,
});

export const proprietaryAppsRelations = relations(
	proprietaryApps,
	({ many }) => ({
		alternatives: many(alternatives),
		tags: many(proprietaryAppTags),
	}),
);

// ─── Alternatives ───────────────────────────────────────────────────
// Junction: proprietary app → privacy-respecting app

export type RelationshipType = "direct" | "fork" | "partial";

export const alternatives = sqliteTable(
	"alternatives",
	{
		id: text("id").primaryKey(),
		proprietaryAppId: text("proprietary_app_id")
			.notNull()
			.references(() => proprietaryApps.id, { onDelete: "cascade" }),
		appId: text("app_id")
			.notNull()
			.references(() => apps.id, { onDelete: "cascade" }),
		relationshipType: text("relationship_type")
			.$type<RelationshipType>()
			.notNull()
			.default("direct"),
		notes: text("notes"), // e.g. "Covers messaging but not video calls"
	},
	(table) => ({
		uniqueAlternative: uniqueIndex("alternative_unique").on(
			table.proprietaryAppId,
			table.appId,
		),
	}),
);

export const alternativesRelations = relations(alternatives, ({ one }) => ({
	proprietaryApp: one(proprietaryApps, {
		fields: [alternatives.proprietaryAppId],
		references: [proprietaryApps.id],
	}),
	app: one(apps, {
		fields: [alternatives.appId],
		references: [apps.id],
	}),
}));

// ─── Tags ───────────────────────────────────────────────────────────

export type TagType =
	| "category" // messaging, browser, navigation, etc.
	| "feature" // encrypted, offline-capable, self-hostable
	| "compatibility" // no-gms, root-required, android-only
	| "design" // material-you, minimal, customizable
	| "platform"; // android, ios, desktop, web

export const tags = sqliteTable(
	"tags",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		type: text("type").$type<TagType>().notNull(),
	},
	(table) => ({
		uniqueTag: uniqueIndex("tag_unique").on(table.slug, table.type),
	}),
);

export const tagsRelations = relations(tags, ({ many }) => ({
	apps: many(appTags),
	proprietaryApps: many(proprietaryAppTags),
}));

// ─── App Tags ───────────────────────────────────────────────────────

export const appTags = sqliteTable(
	"app_tags",
	{
		appId: text("app_id")
			.notNull()
			.references(() => apps.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: uniqueIndex("app_tag_pk").on(table.appId, table.tagId),
	}),
);

export const appTagsRelations = relations(appTags, ({ one }) => ({
	app: one(apps, {
		fields: [appTags.appId],
		references: [apps.id],
	}),
	tag: one(tags, {
		fields: [appTags.tagId],
		references: [tags.id],
	}),
}));

// ─── Proprietary App Tags ───────────────────────────────────────────

export const proprietaryAppTags = sqliteTable(
	"proprietary_app_tags",
	{
		proprietaryAppId: text("proprietary_app_id")
			.notNull()
			.references(() => proprietaryApps.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: uniqueIndex("proprietary_app_tag_pk").on(
			table.proprietaryAppId,
			table.tagId,
		),
	}),
);

export const proprietaryAppTagsRelations = relations(
	proprietaryAppTags,
	({ one }) => ({
		proprietaryApp: one(proprietaryApps, {
			fields: [proprietaryAppTags.proprietaryAppId],
			references: [proprietaryApps.id],
		}),
		tag: one(tags, {
			fields: [proprietaryAppTags.tagId],
			references: [tags.id],
		}),
	}),
);

// ═══════════════════════════════════════════════════════════════════
// VECTOR SEARCH (Turso native)
// ═══════════════════════════════════════════════════════════════════
//
// Turso/libSQL supports vectors as a native column type (F32_BLOB).
// No extensions needed — it just works.
//
// Drizzle doesn't support F32_BLOB natively, so the vector columns
// and indexes are created via raw SQL during database initialization.
// The relational columns (id, foreign key) are managed by Drizzle.
//
// Embedding model: nomic-embed-text-v1.5 (768 dims) or
//                  text-embedding-3-small (1536 dims)
// Generated at seed time, not at query time.

export const EMBEDDING_DIMENSIONS = 768; // adjust if you switch models

/**
 * Raw SQL for creating vector-enabled tables and indexes.
 * Run via client.batch() during database initialization,
 * NOT through Drizzle migrations.
 *
 * Turso vector columns use F32_BLOB(n) type.
 * Indexes use libsql_vector_idx() for ANN search via DiskANN.
 * Queries use vector_top_k() joined back on rowid.
 */
export const VECTOR_INIT_SQL = [
	// App embeddings — text of name + description + tags concatenated
	`CREATE TABLE IF NOT EXISTS app_embeddings (
    app_id TEXT NOT NULL UNIQUE REFERENCES apps(id) ON DELETE CASCADE,
    embedding F32_BLOB(${EMBEDDING_DIMENSIONS})
  )`,
	`CREATE INDEX IF NOT EXISTS app_embeddings_idx ON app_embeddings (
    libsql_vector_idx(embedding, 'metric=cosine')
  )`,

	// Proprietary app embeddings
	`CREATE TABLE IF NOT EXISTS proprietary_app_embeddings (
    proprietary_app_id TEXT NOT NULL UNIQUE REFERENCES proprietary_apps(id) ON DELETE CASCADE,
    embedding F32_BLOB(${EMBEDDING_DIMENSIONS})
  )`,
	`CREATE INDEX IF NOT EXISTS proprietary_app_embeddings_idx ON proprietary_app_embeddings (
    libsql_vector_idx(embedding, 'metric=cosine')
  )`,
] as const;

/**
 * Raw SQL query templates for vector operations.
 * Used with client.execute() since Drizzle can't express these natively.
 */
export const VECTOR_QUERIES = {
	/** Find apps similar to a given embedding vector */
	searchApps: `
    SELECT ae.app_id, vector_distance_cos(ae.embedding, vector(?)) as distance
    FROM vector_top_k('app_embeddings_idx', vector(?), ?)
    JOIN app_embeddings ae ON ae.rowid = id
  `,

	/** Find proprietary apps similar to a given embedding vector */
	searchProprietaryApps: `
    SELECT pae.proprietary_app_id, vector_distance_cos(pae.embedding, vector(?)) as distance
    FROM vector_top_k('proprietary_app_embeddings_idx', vector(?), ?)
    JOIN proprietary_app_embeddings pae ON pae.rowid = id
  `,

	/** Find apps similar to a specific app (by looking up its embedding first) */
	similarApps: `
    SELECT ae2.app_id, vector_distance_cos(ae2.embedding, ae1.embedding) as distance
    FROM app_embeddings ae1,
         vector_top_k('app_embeddings_idx', ae1.embedding, ?)
    JOIN app_embeddings ae2 ON ae2.rowid = id
    WHERE ae1.app_id = ?
      AND ae2.app_id != ?
  `,

	/** Find proprietary apps similar to a specific one */
	similarProprietaryApps: `
    SELECT pae2.proprietary_app_id, vector_distance_cos(pae2.embedding, pae1.embedding) as distance
    FROM proprietary_app_embeddings pae1,
         vector_top_k('proprietary_app_embeddings_idx', pae1.embedding, ?)
    JOIN proprietary_app_embeddings pae2 ON pae2.rowid = id
    WHERE pae1.proprietary_app_id = ?
      AND pae2.proprietary_app_id != ?
  `,

	/** Insert an app embedding */
	insertAppEmbedding: `
    INSERT OR REPLACE INTO app_embeddings (app_id, embedding)
    VALUES (?, vector(?))
  `,

	/** Insert a proprietary app embedding */
	insertProprietaryAppEmbedding: `
    INSERT OR REPLACE INTO proprietary_app_embeddings (proprietary_app_id, embedding)
    VALUES (?, vector(?))
  `,
} as const;
