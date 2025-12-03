import { getSpacesInArc } from "@functions/boardSpace/areas";
import {
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from "@functions/createEmptyBoard";
import { describe, expect, it } from "vitest";

describe("getSpacesInArc", () => {
  const board = createEmptyStandardBoard();
  const smallBoard = createEmptySmallBoard();
  describe("facing orthogonally on a standard board with range 2", () => {
    it("should return the spaces in the arc when facing north from B-5", () => {
      const spacesInArc = getSpacesInArc(board, "B-5", "north", 2);
      expect(spacesInArc).toEqual(new Set(["A-4", "A-5", "A-6"]));
    });
    it("should return the spaces in the arc when facing east from B-5", () => {
      const spacesInArc = getSpacesInArc(board, "B-5", "east", 2);
      expect(spacesInArc).toEqual(
        new Set(["A-6", "B-6", "C-6", "A-7", "B-7", "C-7", "D-7"]),
      );
    });
    it("should return the spaces in the arc when facing south from E-7", () => {
      const spacesInArc = getSpacesInArc(board, "E-7", "south", 2);
      expect(spacesInArc).toEqual(
        new Set(["F-6", "F-7", "F-8", "G-5", "G-6", "G-7", "G-8", "G-9"]),
      );
    });
    describe("facing diagonally on a standard board", () => {
      it("should return the spaces in the arc when facing northEast from E-7 with range 1", () => {
        const spacesInArc = getSpacesInArc(board, "E-7", "northEast", 1);
        expect(spacesInArc).toEqual(new Set(["D-7", "D-8", "E-8"]));
      });
      it("should return the spaces in the arc when facing southEast from B-10 with range 3", () => {
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
    describe("facing diagonally off the map on a small board", () => {
      it("should return the spaces in the arc when facing southWest from H-12 with range 2", () => {
        const spacesInArc = getSpacesInArc(smallBoard, "H-12", "southWest", 2);
        expect(spacesInArc).toEqual(new Set(["H-10", "H-11"]));
      });
    });
  });
});
