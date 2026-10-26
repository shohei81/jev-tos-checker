import { describe, expect, it } from "vitest";
import { CATEGORIES } from "../../core/categories";
import en from "../_locales/en/messages.json";
import ja from "../_locales/ja/messages.json";

describe("_locales", () => {
  it("日本語と英語で同じキーを持つ", () => {
    expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort());
  });

  it("すべてのカテゴリに表示名がある", () => {
    for (const { id } of CATEGORIES) {
      expect(en).toHaveProperty(`category_${id}`);
    }
  });
});
