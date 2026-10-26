import { describe, expect, it } from "vitest";
import { chunk, groupFindings } from "./classify";

describe("chunk", () => {
  it("指定サイズで分割する", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("groupFindings", () => {
  it("しきい値以上の条項だけを、カテゴリごとに確率の高い順で並べる", () => {
    const groups = groupFindings(
      [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      ["c0", "c1", "c2"],
      [
        { a: 0.75, b: 0.1 },
        { a: 0.9, b: 0.69 },
        { a: 0.1, b: 0.0 },
      ],
    );
    expect(groups[0].findings).toEqual([
      { clauseIndex: 1, text: "c1", probability: 0.9 },
      { clauseIndex: 0, text: "c0", probability: 0.75 },
    ]);
    expect(groups[1].findings).toEqual([]);
  });
});
