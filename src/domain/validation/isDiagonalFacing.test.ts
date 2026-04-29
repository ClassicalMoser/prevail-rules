import type { UnitFacing } from "@entities";
import { describe, expect, it } from "vitest";
import { isDiagonalFacing } from "./isDiagonalFacing";

/**
 * isDiagonalFacing: Check if a facing is a diagonal facing.
 */
describe("isDiagonalFacing", () => {
  it("given a diagonal facing, returns true", () => {
    const { result } = isDiagonalFacing("northEast");
    expect(result).toBe(true);
  });
  it("given an orthogonal facing, returns false", () => {
    const { result } = isDiagonalFacing("north");
    expect(result).toBe(false);
  });
  it("given an invalid facing, returns false", () => {
    const { result } = isDiagonalFacing("invalid" as UnitFacing);
    expect(result).toBe(false);
  });
});
