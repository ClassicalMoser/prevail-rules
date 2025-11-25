import { describe, expect, it } from "vitest";
import { filterUndefinedSpaces } from "./filterUndefinedSpaces.js";
describe("filterUndefinedSpaces", () => {
  it("should filter out undefined spaces", () => {
    const spaces = new Set(["A-1", "A-2", undefined, "A-3"]);
    expect(filterUndefinedSpaces(spaces)).toEqual(
      new Set(["A-1", "A-2", "A-3"]),
    );
  });
});
