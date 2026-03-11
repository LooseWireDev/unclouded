const MODEL = "@cf/baai/bge-base-en-v1.5" as const;

export async function embedText(ai: Ai, text: string): Promise<number[]> {
	const result = await ai.run(MODEL, { text: [text] });
	if (!("data" in result) || !result.data?.[0]) {
		throw new Error("Unexpected embedding response format");
	}
	return result.data[0];
}

export async function embedTexts(ai: Ai, texts: string[]): Promise<number[][]> {
	const result = await ai.run(MODEL, { text: texts });
	if (!("data" in result) || !result.data) {
		throw new Error("Unexpected embedding response format");
	}
	return result.data;
}
