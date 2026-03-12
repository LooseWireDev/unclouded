import { env } from "cloudflare:workers";

export function getAI(): Ai {
	return env.AI;
}
