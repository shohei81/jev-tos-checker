import { describe, expect, it } from "vitest";
import { withContext } from "./jev";

describe("withContext", () => {
  it("前後の条項を文脈として添え、長さを絞る", () => {
    const long = "x".repeat(800);
    const inputs = withContext(["a", long, "b"]);
    expect(inputs[0]).toEqual({ text: "a", before: undefined, after: "x".repeat(500) });
    expect(inputs[1]).toEqual({ text: long, before: "a", after: "b" });
    expect(inputs[2].before).toHaveLength(500);
    expect(inputs[2].after).toBeUndefined();
  });
});
