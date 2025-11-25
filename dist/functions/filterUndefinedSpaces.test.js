import { describe, expect, it } from "vitest";
import { filterUndefinedSpaces } from "./filterUndefinedSpaces.js";
describe("filterUndefinedSpaces", () => {
    it("should filter out undefined spaces", () => {
        const spaces = new Set([
            "A1",
            "A2",
            undefined,
            "A3",
        ]);
        expect(filterUndefinedSpaces(spaces)).toEqual(new Set(["A1", "A2", "A3"]));
    });
});
