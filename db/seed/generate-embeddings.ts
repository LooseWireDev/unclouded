import "dotenv/config";
import { getDb, getTursoClient } from "../client";
import {
	apps,
	appTags,
	proprietaryApps,
	tags,
	VECTOR_QUERIES,
} from "../schema";

const db = getDb();
const client = getTursoClient();

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CF_API_TOKEN!;

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
	console.error("CF_ACCOUNT_ID and CF_API_TOKEN must be set in .env");
	process.exit(1);
}

const MODEL = "@cf/bge-base-en-v1.5";
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL}`;
const BATCH_SIZE = 100;

type EmbeddingResponse = {
	success: boolean;
	result: { data: number[][] };
	errors: { message: string }[];
};

async function fetchEmbeddings(texts: string[]): Promise<number[][]> {
	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${CF_API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ text: texts }),
	});

	if (!response.ok) {
		throw new Error(
			`Workers AI API error: ${response.status} ${await response.text()}`,
		);
	}

	const json = (await response.json()) as EmbeddingResponse;
	if (!json.success) {
		throw new Error(
			`Workers AI error: ${json.errors.map((e) => e.message).join(", ")}`,
		);
	}

	return json.result.data;
}

function buildEmbeddingText(
	name: string,
	description: string | null,
	tagNames: string[],
): string {
	const parts = [name];
	if (description) parts.push(description);
	if (tagNames.length) parts.push(`Tags: ${tagNames.join(", ")}`);
	return parts.join(". ");
}

async function generateAppEmbeddings() {
	console.log("Loading apps with tags...");

	const allApps = await db
		.select({ id: apps.id, name: apps.name, description: apps.description })
		.from(apps);

	const allAppTags = await db
		.select({ appId: appTags.appId, tagId: appTags.tagId })
		.from(appTags);

	const allTags = await db.select({ id: tags.id, name: tags.name }).from(tags);

	const tagNameMap = new Map(allTags.map((t) => [t.id, t.name]));
	const appTagMap = new Map<string, string[]>();
	for (const at of allAppTags) {
		const names = appTagMap.get(at.appId) ?? [];
		const tagName = tagNameMap.get(at.tagId);
		if (tagName) names.push(tagName);
		appTagMap.set(at.appId, names);
	}

	const items = allApps.map((app) => ({
		id: app.id,
		text: buildEmbeddingText(
			app.name,
			app.description,
			appTagMap.get(app.id) ?? [],
		),
	}));

	console.log(`Generating embeddings for ${items.length} apps...`);

	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		const batch = items.slice(i, i + BATCH_SIZE);
		const texts = batch.map((item) => item.text);
		const embeddings = await fetchEmbeddings(texts);

		const statements = batch.map((item, idx) => ({
			sql: VECTOR_QUERIES.insertAppEmbedding,
			args: [item.id, JSON.stringify(embeddings[idx])],
		}));

		await client.batch(statements as Parameters<typeof client.batch>[0]);
		console.log(
			`  apps: ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}`,
		);
	}
}

async function generateProprietaryAppEmbeddings() {
	const allPropApps = await db
		.select({
			id: proprietaryApps.id,
			name: proprietaryApps.name,
			description: proprietaryApps.description,
		})
		.from(proprietaryApps);

	const items = allPropApps.map((app) => ({
		id: app.id,
		text: buildEmbeddingText(app.name, app.description, []),
	}));

	console.log(`Generating embeddings for ${items.length} proprietary apps...`);

	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		const batch = items.slice(i, i + BATCH_SIZE);
		const texts = batch.map((item) => item.text);
		const embeddings = await fetchEmbeddings(texts);

		const statements = batch.map((item, idx) => ({
			sql: VECTOR_QUERIES.insertProprietaryAppEmbedding,
			args: [item.id, JSON.stringify(embeddings[idx])],
		}));

		await client.batch(statements as Parameters<typeof client.batch>[0]);
		console.log(
			`  proprietary: ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}`,
		);
	}
}

async function main() {
	console.log("=== Generating Embeddings ===\n");

	await generateAppEmbeddings();
	await generateProprietaryAppEmbeddings();

	console.log("\nDone.");
	client.close();
}

main().catch(console.error);
