import type { ParsedApp } from "./types";

type MatchResult = {
	name: string;
	packageName: string;
	confidence: number;
};

export function fuzzyMatch(
	query: string,
	candidates: ParsedApp[],
	limit = 5,
): MatchResult[] {
	const normalizedQuery = normalize(query);
	const results: MatchResult[] = [];

	for (const candidate of candidates) {
		const normalizedName = normalize(candidate.name);

		if (normalizedName === normalizedQuery) {
			results.push({
				name: candidate.name,
				packageName: candidate.packageName,
				confidence: 100,
			});
			continue;
		}
		if (normalizedName.startsWith(normalizedQuery)) {
			results.push({
				name: candidate.name,
				packageName: candidate.packageName,
				confidence: 90,
			});
			continue;
		}
		if (normalizedName.includes(normalizedQuery)) {
			results.push({
				name: candidate.name,
				packageName: candidate.packageName,
				confidence: 70,
			});
			continue;
		}

		const queryWords = normalizedQuery.split(/\s+/);
		const nameWords = normalizedName.split(/\s+/);
		const allWordsMatch = queryWords.every((qw) =>
			nameWords.some((nw) => nw.includes(qw)),
		);
		if (allWordsMatch && queryWords.length > 0) {
			results.push({
				name: candidate.name,
				packageName: candidate.packageName,
				confidence: 60,
			});
		}
	}

	return results.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}

function normalize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.trim();
}
