import { describe, expect, it } from "vitest";
import { throwIfFalsy, throwIfUndefined } from "./throwIfMissing";

/**
 * throwIfUndefined: returns the value when defined; throws Error(message) only
 * on strict `=== undefined`. `null` / `0` / `""` / `false` pass through unchanged.
 */
describe("throwIfUndefined", () => {
  it("given a defined value, returns the same reference", () => {
    const value = { tag: "kept" };
    expect(throwIfUndefined(value, "missing")).toBe(value);
  });

  it("given undefined, throws Error with the supplied message", () => {
    expect(() => throwIfUndefined<string>(undefined, "no value here")).toThrow("no value here");
  });

  it("given null, returns null (null is not undefined)", () => {
    expect(throwIfUndefined<string | null>(null, "missing")).toBe(null);
  });

  it("given 0, returns 0 (falsy but defined)", () => {
    expect(throwIfUndefined<number>(0, "missing")).toBe(0);
  });

  it("given empty string, returns empty string (falsy but defined)", () => {
    expect(throwIfUndefined<string>("", "missing")).toBe("");
  });

  it("given false, returns false (falsy but defined)", () => {
    expect(throwIfUndefined<boolean>(false, "missing")).toBe(false);
  });
});

/**
 * throwIfFalsy: returns the value when truthy; throws Error(message) on any
 * falsy value (`null`, `undefined`, `0`, `""`, `false`).
 */
describe("throwIfFalsy", () => {
  it("given a defined truthy value, returns the same reference", () => {
    const value = { tag: "kept" };
    expect(throwIfFalsy(value, "missing")).toBe(value);
  });

  it("given a non-empty string, returns the string", () => {
    expect(throwIfFalsy("hello", "missing")).toBe("hello");
  });

  it("given undefined, throws Error with the supplied message", () => {
    expect(() => throwIfFalsy<string>(undefined, "no value here")).toThrow("no value here");
  });

  it("given null, throws Error with the supplied message", () => {
    expect(() => throwIfFalsy<string>(null, "no value here")).toThrow("no value here");
  });

  it("given 0, throws (falsy)", () => {
    expect(() => throwIfFalsy<number>(0, "no value here")).toThrow("no value here");
  });

  it("given empty string, throws (falsy)", () => {
    expect(() => throwIfFalsy<string>("", "no value here")).toThrow("no value here");
  });

  it("given false, throws (falsy)", () => {
    expect(() => throwIfFalsy<boolean>(false, "no value here")).toThrow("no value here");
  });
});
