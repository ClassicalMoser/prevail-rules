import { createEmptySmallBoard, createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getSpacesInArc } from "./getSpacesInArc";

/**
 * getSpacesInArc: ranged-attack style arc: spaces within range along front spread, bounded by board.
 */
describe("getSpacesInArc", () => {
  const board = createEmptyStandardBoard();
  const smallBoard = createEmptySmallBoard();

  describe("orthogonal facings, standard board", () => {
    it("given facing north from B-5 with range 2, returns three-space arc row", () => {
      const spacesInArc = getSpacesInArc(board, "B-5", "north", 2);
      expect(spacesInArc).toEqual(new Set(["A-4", "A-5", "A-6"]));
    });
    it("given facing east from B-5 with range 2, returns stepped arc", () => {
      const spacesInArc = getSpacesInArc(board, "B-5", "east", 2);
      expect(spacesInArc).toEqual(new Set(["A-6", "B-6", "C-6", "A-7", "B-7", "C-7", "D-7"]));
    });
    it("given facing south from E-7 with range 2, returns wider arc", () => {
      const spacesInArc = getSpacesInArc(board, "E-7", "south", 2);
      expect(spacesInArc).toEqual(
        new Set(["F-6", "F-7", "F-8", "G-5", "G-6", "G-7", "G-8", "G-9"]),
      );
    });
  });

  describe("diagonal facings, standard board", () => {
    it("given facing northEast from E-7 with range 1, returns three-space arc", () => {
      const spacesInArc = getSpacesInArc(board, "E-7", "northEast", 1);
      expect(spacesInArc).toEqual(new Set(["D-7", "D-8", "E-8"]));
    });
    it("given facing southEast from B-10 with range 3, returns extended arc", () => {
      const spacesInArc = getSpacesInArc(board, "B-10", "southEast", 3);
      expect(spacesInArc).toEqual(
        new Set([
          "B-11",
          "B-12",
          "B-13",
          "C-10",
          "C-11",
          "C-12",
          "C-13",
          "D-10",
          "D-11",
          "D-12",
          "D-13",
          "E-10",
          "E-11",
          "E-12",
          "E-13",
        ]),
      );
    });
  });

  describe("small board edge", () => {
    it("given facing southWest from H-12 with range 2, clips to in-bounds", () => {
      const spacesInArc = getSpacesInArc(smallBoard, "H-12", "southWest", 2);
      expect(spacesInArc).toEqual(new Set(["H-10", "H-11"]));
    });
  });
});
