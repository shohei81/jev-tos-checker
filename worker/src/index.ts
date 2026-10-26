import { judgeClause, type ClauseResult } from "../../core/jev";

export interface Env {
  TYPESAFE_API_KEY: string;
  JEV_MODEL?: string;
}

// Workers 無料プランのサブリクエスト上限(50)に収まる件数
export const MAX_CLAUSES_PER_REQUEST = 40;
const MAX_CLAUSE_LENGTH = 4000;

export interface AnalyzeResponse {
  results: ClauseResult[];
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/analyze") {
      return json({ error: "Not found" }, 404);
    }

    let clauses: unknown;
    try {
      clauses = ((await request.json()) as { clauses?: unknown }).clauses;
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (
      !Array.isArray(clauses) ||
      clauses.length === 0 ||
      clauses.length > MAX_CLAUSES_PER_REQUEST ||
      !clauses.every(
        (c) => typeof c === "string" && c.length > 0 && c.length <= MAX_CLAUSE_LENGTH,
      )
    ) {
      return json(
        {
          error: `clauses must be 1-${MAX_CLAUSES_PER_REQUEST} non-empty strings of at most ${MAX_CLAUSE_LENGTH} chars`,
        },
        400,
      );
    }

    try {
      const results = await Promise.all(
        (clauses as string[]).map((c) => judgeClause(c, env.TYPESAFE_API_KEY, env.JEV_MODEL)),
      );
      const response: AnalyzeResponse = { results };
      return json(response);
    } catch (e) {
      return json({ error: (e as Error).message }, 502);
    }
  },
};
