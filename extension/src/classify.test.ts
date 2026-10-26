import { describe, expect, it } from "vitest";
import { chunk, groupFindings, levelOf } from "./classify";

describe("levelOf", () => {
  it("しきい値で要注意・要確認・未検出に分ける", () => {
    expect(levelOf(0.7)).toBe("high");
    expect(levelOf(0.69)).toBe("review");
    expect(levelOf(0.3)).toBe("review");
    expect(levelOf(0.29)).toBeNull();
  });
});

describe("chunk", () => {
  it("指定サイズで分割する", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("groupFindings", () => {
  it("カテゴリごとに該当条項を Noul の高い順に並べる", () => {
    const groups = groupFindings(
      [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      ["c0", "c1", "c2"],
      [
        { a: 0.4, b: 0.1 },
        { a: 0.9, b: 0.2 },
        { a: 0.1, b: 0.0 },
      ],
    );
    expect(groups[0].findings).toEqual([
      { clauseIndex: 1, text: "c1", noul: 0.9, level: "high" },
      { clauseIndex: 0, text: "c0", noul: 0.4, level: "review" },
    ]);
    expect(groups[1].findings).toEqual([]);
  });
});
