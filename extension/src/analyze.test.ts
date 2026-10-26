import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyzeError, analyzeClauses, mapWithConcurrency } from "./analyze";

afterEach(() => vi.unstubAllGlobals());

function jevResponse(noul: number): Response {
  return Response.json({
    answers: Object.fromEntries(
      [
        "data_sharing",
        "unilateral_change",
        "liability_limitation",
        "account_termination",
        "dispute_resolution",
      ].map((id) => [id, { type: "noul", noul }]),
    ),
  });
}

describe("mapWithConcurrency", () => {
  it("同時実行数を守りつつ入力順で結果を返す", async () => {
    let running = 0;
    let maxRunning = 0;
    const results = await mapWithConcurrency(
      [30, 10, 20, 5],
      2,
      async (ms) => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((r) => setTimeout(r, ms));
        running--;
        return ms * 2;
      },
      () => {},
    );
    expect(results).toEqual([60, 20, 40, 10]);
    expect(maxRunning).toBe(2);
  });
});

describe("analyzeClauses", () => {
  it("APIキー設定では Jev を直接呼び、進捗を通知する", async () => {
    const fetchMock = vi.fn(async (_url: string) => jevResponse(0.8));
    vi.stubGlobal("fetch", fetchMock);
    const progress: number[] = [];
    const results = await analyzeClauses(
      ["a", "b"],
      { mode: "apiKey", apiKey: "k" },
      (done) => progress.push(done),
    );
    expect(results).toHaveLength(2);
    expect(results[0].data_sharing).toBe(0.8);
    expect(progress).toEqual([1, 2]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.typesafe.ai/v1/systemone");
  });

  it("APIキーが拒否されたら invalidApiKey", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 401 })));
    await expect(
      analyzeClauses(["a"], { mode: "apiKey", apiKey: "bad" }, () => {}),
    ).rejects.toMatchObject({ kind: "invalidApiKey" } satisfies Partial<AnalyzeError>);
  });

  it("サーバー設定では 40 件ずつ /analyze に送る", async () => {
    const fetchMock = vi.fn(async (_url: URL, init: RequestInit) => {
      const { clauses } = JSON.parse(init.body as string) as { clauses: string[] };
      return Response.json({ results: clauses.map(() => ({ data_sharing: 0.1 })) });
    });
    vi.stubGlobal("fetch", fetchMock);
    const results = await analyzeClauses(
      Array.from({ length: 90 }, (_, i) => `c${i}`),
      { mode: "server", serverUrl: "https://example.com" },
      () => {},
    );
    expect(results).toHaveLength(90);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://example.com/analyze");
  });
});
