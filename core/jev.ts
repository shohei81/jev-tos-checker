import { CATEGORIES, type CategoryId } from "./categories";

const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const DEFAULT_MODEL = "jev-latest";

// カテゴリごとの「悪質」(Score の最上位) である確率
export type ClauseResult = Record<CategoryId, number>;

// 判定する条項と、その解釈を助ける前後の文 (直後の但し書きなど)
export interface ClauseInput {
  text: string;
  before?: string;
  after?: string;
}

const CONTEXT_LENGTH = 500;

// 前後の条項を文脈として添える。関係のない文が増えると精度が落ちるので長さを絞る
export function withContext(clauses: string[]): ClauseInput[] {
  return clauses.map((text, i) => ({
    text,
    before: clauses[i - 1]?.slice(-CONTEXT_LENGTH),
    after: clauses[i + 1]?.slice(0, CONTEXT_LENGTH),
  }));
}

const ABUSIVE_LEVEL = "3";

const QUESTIONS = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    {
      type: "score",
      instructions:
        "The text may be written in any language. Judge only `clause`. `context_before` and `context_after` are neighboring text from the same document, given only to help interpret `clause` (for example, exceptions that follow it). " +
        `How does \`clause\` treat users regarding ${c.topic}?`,
      criteria: [
        `It does not address ${c.topic}.`,
        `Standard or protective of users. This includes practices common among major online services, such as ${c.common}.`,
        "Somewhat stricter than usual, but not abusive.",
        `Abusive: it goes well beyond common practice, such as ${c.abusive}.`,
      ],
    },
  ]),
);

export class JevError extends Error {
  constructor(readonly status: number, body: string) {
    super(`Jev API ${status}: ${body}`);
  }
}

export async function judgeClause(
  input: ClauseInput,
  apiKey: string,
  model = DEFAULT_MODEL,
): Promise<ClauseResult> {
  const res = await fetch(JEV_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      state: {
        clause: input.text,
        context_before: input.before ?? "",
        context_after: input.after ?? "",
      },
      questions: QUESTIONS,
    }),
  });
  if (!res.ok) {
    throw new JevError(res.status, await res.text());
  }
  const body = (await res.json()) as {
    answers: Record<string, { probabilities: Record<string, number> }>;
  };
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.id, body.answers[c.id].probabilities[ABUSIVE_LEVEL] ?? 0]),
  ) as ClauseResult;
}
