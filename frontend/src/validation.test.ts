import { parseOperand } from "./validation";

describe("parseOperand", () => {
  it.each([["42", 42], [" -3.5 ", -3.5], ["+7", 7], [".5", 0.5], ["5.", 5]])("accepts %s", (raw, expected) => {
    expect(parseOperand(raw, "Number")).toEqual({ ok: true, value: expected });
  });

  it("rejects empty input", () => {
    expect(parseOperand("  ", "Base")).toEqual({ ok: false, error: "Base is required" });
  });

  it.each(["abc", "1e5", "1,5", "--2", "1.2.3", "NaN", "Infinity"])("rejects %s", (raw) => {
    expect(parseOperand(raw, "Number")).toEqual({ ok: false, error: "Number must be a valid number" });
  });

  it("rejects numbers too large to represent", () => {
    expect(parseOperand("9".repeat(400), "Number")).toEqual({ ok: false, error: "Number is too large" });
  });
});
