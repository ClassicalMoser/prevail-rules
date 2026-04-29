import type { Modifier } from "@entities";
import { describe, expect, it } from "vitest";
import { areModifiersArraysEqual } from "./areModifiersArraysEqual";

/**
 * areModifiersArraysEqual: Compares two arrays of Modifiers for equality.
 */
describe("areModifiersArraysEqual", () => {
  it("given both arrays are empty, returns true", () => {
    const modifiers1: Modifier[] = [];
    const modifiers2: Modifier[] = [];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it("given both arrays have identical modifiers in same order, returns true", () => {
    const modifiers1: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "speed", value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "speed", value: 2 },
    ];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it("given comparing array to itself, returns true", () => {
    const modifiers: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "defense", value: 2 },
    ];
    const { result } = areModifiersArraysEqual(modifiers, modifiers);
    expect(result).toBe(true);
  });

  it("given different array references with same values, returns true", () => {
    const modifiers1: Modifier[] = [{ type: "attack", value: 1 }];
    const modifiers2: Modifier[] = [{ type: "attack", value: 1 }];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it("given arrays have different lengths, returns false", () => {
    const modifiers1: Modifier[] = [{ type: "attack", value: 1 }];
    const modifiers2: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "speed", value: 2 },
    ];
    const validationResult = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain("different lengths");
    }
  });

  it("given arrays differ at an index, returns false", () => {
    const modifiers1: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "speed", value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "speed", value: 3 },
    ];
    const validationResult = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain("differ at index");
    }
  });

  it("given arrays have same modifiers in different order, returns false", () => {
    const modifiers1: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "speed", value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: "speed", value: 2 },
      { type: "attack", value: 1 },
    ];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(false);
  });

  it("given first array is empty and second is not, returns false", () => {
    const modifiers1: Modifier[] = [];
    const modifiers2: Modifier[] = [{ type: "attack", value: 1 }];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(false);
  });

  it("given second array is empty and first is not, returns false", () => {
    const modifiers1: Modifier[] = [{ type: "attack", value: 1 }];
    const modifiers2: Modifier[] = [];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(false);
  });

  it("given handle single element arrays correctly", () => {
    const modifiers1: Modifier[] = [{ type: "defense", value: 2 }];
    const modifiers2: Modifier[] = [{ type: "defense", value: 2 }];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it("given handle arrays with multiple identical modifiers", () => {
    const modifiers1: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "attack", value: 1 },
      { type: "attack", value: 1 },
    ];
    const modifiers2: Modifier[] = [
      { type: "attack", value: 1 },
      { type: "attack", value: 1 },
      { type: "attack", value: 1 },
    ];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it("given comparing arrays to undefined, returns false", () => {
    const modifiers: Modifier[] = [{ type: "attack", value: 1 }];
    // Intentional type error to test the function
    const { result } = areModifiersArraysEqual(modifiers, undefined as unknown as Modifier[]);
    expect(result).toBe(false);
  });
});
