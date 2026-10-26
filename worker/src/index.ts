import { judgeClause, type ClauseInput, type ClauseResult } from "../../core/jev";

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

function isClauseInput(c: unknown): c is ClauseInput {
  if (typeof c !== "object" || c === null) return false;
  const { text, before, after } = c as Record<string, unknown>;
  const optional = (v: unknown) =>
    v === undefined || (typeof v === "string" && v.length <= MAX_CLAUSE_LENGTH);
  return (
    typeof text === "string" &&
    text.length > 0 &&
    text.length <= MAX_CLAUSE_LENGTH &&
    optional(before) &&
    optional(after)
  );
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
      !clauses.every(isClauseInput)
    ) {
      return json(
        {
          error: `clauses must be 1-${MAX_CLAUSES_PER_REQUEST} objects with a non-empty text, and optional before/after, each at most ${MAX_CLAUSE_LENGTH} chars`,
        },
        400,
      );
    }

    try {
      const results = await Promise.all(
        (clauses as ClauseInput[]).map((c) =>
          judgeClause(c, env.TYPESAFE_API_KEY, env.JEV_MODEL),
        ),
      );
      const response: AnalyzeResponse = { results };
      return json(response);
    } catch (e) {
      return json({ error: (e as Error).message }, 502);
    }
  },
};
