import type { Modifier } from "@entities";
import { describe, expect, it } from "vitest";
import { areModifiersEqual } from "./areModifiersEqual";

/**
 * areModifiersEqual: Compares two Modifier objects for equality by comparing all properties.
 */
describe("areModifiersEqual", () => {
  it("given both modifiers have the same type and value, returns true", () => {
    const modifier1: Modifier = { type: "attack", value: 1 };
    const modifier2: Modifier = { type: "attack", value: 1 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });

  it("given modifiers have different types, returns false", () => {
    const modifier1: Modifier = { type: "attack", value: 1 };
    const modifier2: Modifier = { type: "speed", value: 1 };
    const validationResult = areModifiersEqual(modifier1, modifier2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain("different types");
    }
  });

  it("given modifiers have different values, returns false", () => {
    const modifier1: Modifier = { type: "attack", value: 1 };
    const modifier2: Modifier = { type: "attack", value: 2 };
    const validationResult = areModifiersEqual(modifier1, modifier2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain("different values");
    }
  });

  it("given comparing a modifier to itself, returns true", () => {
    const modifier: Modifier = { type: "attack", value: 1 };
    const { result } = areModifiersEqual(modifier, modifier);
    expect(result).toBe(true);
  });

  it("given different object references with same values, returns true", () => {
    const modifier1: Modifier = { type: "defense", value: 2 };
    const modifier2: Modifier = { type: "defense", value: 2 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });

  it("given comparing a modifier to undefined, returns false", () => {
    const modifier: Modifier = { type: "attack", value: 1 };
    // Intentional type error to test the function
    const { result } = areModifiersEqual(modifier, undefined as unknown as Modifier);
    expect(result).toBe(false);
  });

  it("given handle negative values correctly", () => {
    const modifier1: Modifier = { type: "attack", value: -1 };
    const modifier2: Modifier = { type: "attack", value: -1 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });

  it("given handle zero values correctly", () => {
    const modifier1: Modifier = { type: "speed", value: 0 };
    const modifier2: Modifier = { type: "speed", value: 0 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });
});
