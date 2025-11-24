import { describe, expect, it } from "vitest";
import { getInlineSpaces } from "./getInlineSpaces.js";

describe("getInlineSpaces", () => {
  it("should return the inline spaces for a given coordinate with an orthogonal facing", () => {
    expect(getInlineSpaces("A1", "south")).toEqual(
      new Set([
        "A1",
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "A8",
        "A9",
        "A10",
        "A11",
        "A12",
        "A13",
        "A14",
        "A15",
        "A16",
        "A17",
        "A18",
      ])
    );
    expect(getInlineSpaces("E5", "east")).toEqual(
      new Set([
        "A5",
        "B5",
        "C5",
        "D5",
        "E5",
        "F5",
        "G5",
        "H5",
        "I5",
        "J5",
        "K5",
        "L5",
      ])
    );
  });
  it("should return the inline spaces for a given coordinate with a diagonal facing", () => {
    expect(getInlineSpaces("E5", "northEast")).toEqual(
      new Set([
        "A1",
        "B2",
        "C3",
        "D4",
        "E5",
        "F6",
        "G7",
        "H8",
        "I9",
        "J10",
        "K11",
        "L12",
      ])
    );
    expect(getInlineSpaces("E5", "southEast")).toEqual(
      new Set(["A9", "B8", "C7", "D6", "E5", "F4", "G3", "H2", "I1"])
    );
  });
});
