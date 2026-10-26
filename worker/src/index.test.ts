import { afterEach, describe, expect, it, vi } from "vitest";
import { CATEGORIES } from "../../core/categories";
import worker, { type AnalyzeResponse } from "./index";

const env = { TYPESAFE_API_KEY: "test-key" };

function analyze(body: unknown): Promise<Response> {
  return worker.fetch(
    new Request("http://worker/analyze", { method: "POST", body: JSON.stringify(body) }),
    env,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /analyze", () => {
  it("条項ごとに 5 カテゴリの Noul を Jev に問い合わせて返す", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const req = JSON.parse(init.body as string);
      const answers = Object.fromEntries(
        Object.keys(req.questions).map((id) => [
          id,
          { type: "score", probabilities: { "0": 0, "1": 0, "2": 0, "3": req.state.clause === "risky" ? 0.9 : 0.1 } },
        ]),
      );
      return Response.json({ model: "jev-latest", answers, usage: {} });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await analyze({ clauses: [{ text: "safe", after: "risky" }, { text: "risky", before: "safe" }] });
    expect(res.status).toBe(200);
    const body = (await res.json()) as AnalyzeResponse;
    expect(Object.keys(body.results[0])).toEqual(CATEGORIES.map((c) => c.id));
    expect(body.results[0].data_sharing).toBe(0.1);
    expect(body.results[1].dispute_resolution).toBe(0.9);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.typesafe.ai/v1/systemone");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const sent = JSON.parse(init.body as string);
    expect(sent.model).toBe("jev-latest");
    expect(sent.questions.data_sharing.type).toBe("score");
    expect(sent.questions.data_sharing.criteria).toHaveLength(4);
    expect(sent.state).toEqual({ clause: "safe", context_before: "", context_after: "risky" });
    expect(sent.questions.data_sharing.instructions).toContain("any language");
  });

  it("不正な入力は 400", async () => {
    expect((await analyze({ clauses: [] })).status).toBe(400);
    expect((await analyze({ clauses: Array(41).fill({ text: "x" }) })).status).toBe(400);
    expect((await analyze({ clauses: ["x"] })).status).toBe(400);
    expect((await analyze({ clauses: [{ text: "" }] })).status).toBe(400);
    expect((await analyze({ clauses: [{ text: "x", after: 1 }] })).status).toBe(400);
  });

  it("Jev API のエラーは 502", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unauthorized", { status: 401 })));
    const res = await analyze({ clauses: [{ text: "x" }] });
    expect(res.status).toBe(502);
  });
});
