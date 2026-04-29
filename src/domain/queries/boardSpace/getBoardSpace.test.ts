import type { SmallBoard, StandardBoard, StandardBoardCoordinate } from "@entities";
import { createEmptySmallBoard, createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getBoardSpace } from "./getBoardSpace";

const standardBoard: StandardBoard = createEmptyStandardBoard();
const smallBoard: SmallBoard = createEmptySmallBoard();

/**
 * getBoardSpace: looks up the tile record at a coordinate; throws if the coordinate is missing from the board
 * map or not a valid coordinate for that board shape.
 */
describe("getBoardSpace", () => {
  describe("standard board", () => {
    it("given E-5, returns space with terrain, elevation, unitPresence", () => {
      const space = getBoardSpace(standardBoard, "E-5");
      expect(space).toBeDefined();
      expect(space.terrainType).toBeDefined();
      expect(space.elevation).toBeDefined();
      expect(space.unitPresence).toBeDefined();
    });

    it("given A-1, returns defined space", () => {
      const space = getBoardSpace(standardBoard, "A-1");
      expect(space).toBeDefined();
    });

    it("given L-18, returns defined space", () => {
      const space = getBoardSpace(standardBoard, "L-18");
      expect(space).toBeDefined();
    });

    it("given coordinate deleted from board map, throws", () => {
      const boardWithMissingSpace: StandardBoard = {
        ...standardBoard,
        board: {
          ...standardBoard.board,
        },
      };
      delete boardWithMissingSpace.board["E-5" as StandardBoardCoordinate];

      expect(() => {
        getBoardSpace(boardWithMissingSpace, "E-5");
      }).toThrow(new Error("Coordinate E-5 does not exist on standard board."));
    });

    it("given invalid coordinate string for standard board, throws", () => {
      expect(() => {
        getBoardSpace(standardBoard, "Y-55" as StandardBoardCoordinate);
      }).toThrow(new Error("Coordinate Y-55 does not exist on standard board."));
    });
  });

  describe("small board", () => {
    it("given E-5, returns space with terrain, elevation, unitPresence", () => {
      const space = getBoardSpace(smallBoard, "E-5");
      expect(space).toBeDefined();
      expect(space.terrainType).toBeDefined();
      expect(space.elevation).toBeDefined();
      expect(space.unitPresence).toBeDefined();
    });

    it("given A-1, returns defined space", () => {
      const space = getBoardSpace(smallBoard, "A-1");
      expect(space).toBeDefined();
    });

    it("given H-12, returns defined space", () => {
      const space = getBoardSpace(smallBoard, "H-12");
      expect(space).toBeDefined();
    });
  });
});
