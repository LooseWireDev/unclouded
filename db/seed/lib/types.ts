import type { RelationshipType, SourceType, TagType } from "../../schema";

/** Intermediate format: a parsed app from any automated source */
export type ParsedApp = {
	packageName: string;
	name: string;
	description?: string;
	summary?: string;
	iconUrl?: string;
	license?: string;
	websiteUrl?: string;
	repositoryUrl?: string;
	categories?: string[];
	antiFeatures?: string[];
	sources: ParsedAppSource[];
};

export type ParsedAppSource = {
	source: SourceType;
	url: string;
	metadata?: {
		apkFilterRegex?: string;
		preferred?: boolean;
		additionalSettings?: Record<string, unknown>;
		/** Full Obtainium config for generating deep links */
		obtainiumConfig?: Record<string, unknown>;
	};
};

/** Curated seed data: proprietary app */
export type ProprietaryAppSeed = {
	name: string;
	slug: string;
	packageName?: string;
	description?: string;
	iconUrl?: string;
	websiteUrl?: string;
	tags: string[]; // tag slugs
};

/** Curated seed data: alternative mapping */
export type AlternativeSeed = {
	proprietarySlug: string;
	appPackageName?: string;
	appSlug?: string; // for web-only apps without package names
	relationshipType: RelationshipType;
	notes?: string;
};

/** Curated seed data: tag definition */
export type TagSeed = {
	name: string;
	slug: string;
	type: TagType;
};

/** Curated seed data: web/desktop app without Android package */
export type WebAppSeed = {
	name: string;
	slug: string;
	description: string;
	websiteUrl: string;
	repositoryUrl?: string;
	tags: string[]; // tag slugs
};

/** Curated seed data: app override/enrichment */
export type AppOverrideSeed = {
	packageName: string;
	description?: string;
	websiteUrl?: string;
	repositoryUrl?: string;
	iconUrl?: string;
	tags?: string[]; // additional tag slugs to apply
};
