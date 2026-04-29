import { describe, expect, it } from "vitest";
import { hasMove } from "./hasMove";

/**
 * hasMove: Checks if a coordinate (and optionally facing) is present in a set of legal moves.
 */
describe("hasMove", () => {
  it("given coordinate and facing match, returns true", () => {
    const legalMoves = new Set([
      { coordinate: "E-5", facing: "north" as const },
      { coordinate: "E-6", facing: "south" as const },
    ]);
    expect(hasMove(legalMoves, "E-5", "north")).toBe(true);
    expect(hasMove(legalMoves, "E-6", "south")).toBe(true);
  });

  it("given coordinate matches and facing not specified, returns true", () => {
    const legalMoves = new Set([{ coordinate: "E-5", facing: "north" as const }]);
    expect(hasMove(legalMoves, "E-5")).toBe(true);
  });

  it("given coordinate not in moves, returns false", () => {
    const legalMoves = new Set([{ coordinate: "E-5", facing: "north" as const }]);
    expect(hasMove(legalMoves, "E-6")).toBe(false);
  });

  it("given facing does not match, returns false", () => {
    const legalMoves = new Set([{ coordinate: "E-5", facing: "north" as const }]);
    expect(hasMove(legalMoves, "E-5", "south")).toBe(false);
  });
});
