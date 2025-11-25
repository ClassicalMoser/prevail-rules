import { describe, expect, it } from "vitest";
import { getAdjacentSpaces } from "./getAdjacentSpaces.js";
describe("getAdjacentSpaces", () => {
    it("should return the adjacent spaces for a given coordinate", () => {
        expect(getAdjacentSpaces("A1")).toEqual(new Set(["B1", "B2", "A2"]));
        expect(getAdjacentSpaces("E5")).toEqual(new Set(["D4", "D5", "D6", "E4", "E6", "F4", "F5", "F6"]));
        expect(getAdjacentSpaces("L18")).toEqual(new Set(["K18", "K17", "L17"]));
    });
});
