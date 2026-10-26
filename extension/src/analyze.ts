import { judgeClause, JevError, type ClauseResult } from "../../core/jev";
import { chunk } from "./classify";
import { t } from "./i18n";
import type { Settings } from "./settings";

// worker/src/index.ts の MAX_CLAUSES_PER_REQUEST と一致させる
const CLAUSES_PER_REQUEST = 40;
// APIキー直結時に同時に投げるリクエスト数
const DIRECT_CONCURRENCY = 8;

// 原因ごとに表示メッセージを切り替えるためのエラー
export class AnalyzeError extends Error {
  constructor(
    readonly kind: "invalidApiKey" | "server" | "network",
    readonly status?: number,
  ) {
    super(kind);
  }
}

export function errorMessage(e: unknown): string {
  if (e instanceof AnalyzeError) {
    if (e.kind === "invalidApiKey") return t("errorInvalidApiKey");
    if (e.kind === "server") return t("errorServer", String(e.status));
    return t("errorNetwork");
  }
  return t("errorUnknown", (e as Error).message);
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  onDone: () => void,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
      onDone();
    }
  });
  await Promise.all(workers);
  return results;
}

async function judgeDirect(clause: string, apiKey: string): Promise<ClauseResult> {
  try {
    return await judgeClause(clause, apiKey);
  } catch (e) {
    if (e instanceof JevError) {
      throw e.status === 401 || e.status === 403
        ? new AnalyzeError("invalidApiKey")
        : new AnalyzeError("server", e.status);
    }
    throw new AnalyzeError("network");
  }
}

async function analyzeOnServer(serverUrl: string, clauses: string[]): Promise<ClauseResult[]> {
  let res: Response;
  try {
    res = await fetch(new URL("/analyze", serverUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clauses }),
    });
  } catch {
    throw new AnalyzeError("network");
  }
  if (!res.ok) throw new AnalyzeError("server", res.status);
  return ((await res.json()) as { results: ClauseResult[] }).results;
}

export async function analyzeClauses(
  clauses: string[],
  settings: Settings,
  onProgress: (done: number) => void,
): Promise<ClauseResult[]> {
  if (settings.mode === "apiKey") {
    let done = 0;
    return mapWithConcurrency(
      clauses,
      DIRECT_CONCURRENCY,
      (c) => judgeDirect(c, settings.apiKey),
      () => onProgress(++done),
    );
  }
  const results: ClauseResult[] = [];
  for (const part of chunk(clauses, CLAUSES_PER_REQUEST)) {
    results.push(...(await analyzeOnServer(settings.serverUrl, part)));
    onProgress(results.length);
  }
  return results;
}
