import { describe, expect, it } from "vitest";
import { getForwardSpacesToEdge } from "./getForwardSpacesToEdge.js";

describe("getForwardSpacesToEdge", () => {
  it("should return the forward spaces to the edge for a given coordinate with an orthogonal facing", () => {
    expect(getForwardSpacesToEdge("A1", "south")).toEqual(
      new Set([
        "B1",
        "C1",
        "D1",
        "E1",
        "F1",
        "G1",
        "H1",
        "I1",
        "J1",
        "K1",
        "L1",
      ])
    );
    expect(getForwardSpacesToEdge("E5", "east")).toEqual(
      new Set([
        "E6",
        "E7",
        "E8",
        "E9",
        "E10",
        "E11",
        "E12",
        "E13",
        "E14",
        "E15",
        "E16",
        "E17",
        "E18",
      ])
    );
  });
  it("should return the forward spaces to the edge for a given coordinate with a diagonal facing", () => {
    expect(getForwardSpacesToEdge("E5", "northEast")).toEqual(
      new Set(["D6", "C7", "B8", "A9"])
    );
    expect(getForwardSpacesToEdge("E5", "southEast")).toEqual(
      new Set(["F6", "G7", "H8", "I9", "J10", "K11", "L12"])
    );
    expect(getForwardSpacesToEdge("G9", "southWest")).toEqual(
      new Set(["H8", "I7", "J6", "K5", "L4"])
    );
    expect(getForwardSpacesToEdge("G9", "northWest")).toEqual(
      new Set(["F8", "E7", "D6", "C5", "B4", "A3"])
    );
  });
});
