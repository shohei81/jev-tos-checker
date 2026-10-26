import { CATEGORIES, type CategoryId } from "./categories";

const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const DEFAULT_MODEL = "jev-latest";

export type ClauseResult = Record<CategoryId, number>;

// 規約は任意の言語で書かれうるので、質問は英語のまま言語非依存であることを明示する
const LANGUAGE_NOTE = "The clause may be written in any language. ";

const QUESTIONS = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    { type: "noul", instructions: LANGUAGE_NOTE + c.instructions, criteria: c.criteria },
  ]),
);

export class JevError extends Error {
  constructor(readonly status: number, body: string) {
    super(`Jev API ${status}: ${body}`);
  }
}

export async function judgeClause(
  clause: string,
  apiKey: string,
  model = DEFAULT_MODEL,
): Promise<ClauseResult> {
  const res = await fetch(JEV_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, state: clause, questions: QUESTIONS }),
  });
  if (!res.ok) {
    throw new JevError(res.status, await res.text());
  }
  const body = (await res.json()) as {
    answers: Record<string, { noul: number }>;
  };
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.id, body.answers[c.id].noul]),
  ) as ClauseResult;
}
