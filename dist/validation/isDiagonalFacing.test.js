import { describe, expect, it } from "vitest";
import { isDiagonalFacing } from "./isDiagonalFacing.js";
describe("isDiagonalFacing", () => {
    it("should return true for a diagonal facing", () => {
        expect(isDiagonalFacing("northEast")).toBe(true);
    });
    it("should return false for an orthogonal facing", () => {
        expect(isDiagonalFacing("north")).toBe(false);
    });
    it("should return false for an invalid facing", () => {
        expect(isDiagonalFacing("invalid")).toBe(false);
    });
});
