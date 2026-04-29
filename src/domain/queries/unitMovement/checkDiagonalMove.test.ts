import { MIN_FLEXIBILITY_THRESHOLD } from "@ruleValues";
import { createEmptyGameState, createGameState, createTestUnit } from "@testing";
import { addUnitToBoard, createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { checkDiagonalMove } from "./checkDiagonalMove";

/**
 * checkDiagonalMove: whether a diagonal step is legal given the two bracketing orthogonals and occupancy.
 */
describe("checkDiagonalMove", () => {
  describe("non-diagonal facings", () => {
    it("given the facing is not diagonal, throws", () => {
      const gameState = createGameState([
        { coord: "E-5", player: "black", facing: "north", speed: 2 },
      ]);
      expect(() => checkDiagonalMove("black", 0, gameState, "E-5", "E-6", "north")).toThrow(
        "Facing must be diagonal",
      );
    });
  });
  describe("diagonal facings with no enemy units", () => {
    it("given both adjacent spaces are empty, returns true", () => {
      const gameState = createGameState([
        { coord: "E-5", player: "black", facing: "northEast", speed: 2 },
      ]);
      expect(checkDiagonalMove("black", 0, gameState, "E-5", "E-6", "northEast")).toBe(true);
    });
  });
  describe("diagonal facings with enemy units", () => {
    it("given only one adjacent space is occupied by an enemy, returns true", () => {
      const gameState = createGameState([
        { coord: "E-5", player: "black", facing: "northEast", speed: 2 },
        { coord: "D-5", player: "white", facing: "north", speed: 2 },
      ]);
      expect(checkDiagonalMove("black", 0, gameState, "E-5", "E-6", "northEast")).toBe(true);
    });
    it("given both adjacent spaces are occupied by enemy units, returns false", () => {
      const gameState = createGameState([
        { coord: "E-5", player: "black", facing: "northEast", speed: 2 },
        { coord: "D-5", player: "white", facing: "north", speed: 2 },
        { coord: "E-6", player: "white", facing: "north", speed: 2 },
      ]);
      expect(checkDiagonalMove("black", 0, gameState, "E-5", "E-6", "northEast")).toBe(false);
    });
  });
  describe("diagonal facings with engaged units", () => {
    it("given only one adjacent space is occupied by engaged units, returns true", () => {
      // Create game state with engaged units at D-5, and unit under test at E-5
      let board = createEmptyStandardBoard();

      // Add engaged units at D-5 (first unit, then second with opposite facing creates engagement)
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("black", { speed: 2 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "D-5",
          facing: "north",
        },
      });
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("white", { speed: 2 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "D-5",
          facing: "south",
        },
      });

      // Add unit under test at E-5
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("black", { speed: 2, instanceNumber: 3 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "E-5",
          facing: "northEast",
        },
      });

      const gameState = createEmptyGameState();
      gameState.boardState = board;
      expect(checkDiagonalMove("black", 0, gameState, "E-5", "D-6", "northEast")).toBe(true);
    });
    it("given both adjacent spaces are occupied by engaged units, returns false", () => {
      // Create game state with engaged units at D-5 and E-6, and unit under test at E-5
      let board = createEmptyStandardBoard();

      // Add engaged units at D-5 (first unit, then second with opposite facing creates engagement)
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("black", { speed: 2 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "D-5",
          facing: "north",
        },
      });
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("white", { speed: 2 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "D-5",
          facing: "south",
        },
      });

      // Add engaged units at E-6
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("black", { speed: 2, instanceNumber: 2 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "E-6",
          facing: "north",
        },
      });
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("white", { speed: 2, instanceNumber: 2 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "E-6",
          facing: "south",
        },
      });

      // Add unit under test at E-5
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: createTestUnit("black", { speed: 2, instanceNumber: 3 }),
        placement: {
          boardType: "standard" as const,
          coordinate: "E-5",
          facing: "northEast",
        },
      });

      const gameState = createEmptyGameState();
      gameState.boardState = board;
      expect(checkDiagonalMove("black", 0, gameState, "E-5", "D-6", "northEast")).toBe(false);
    });
  });
  describe("diagonal facings with friendly units", () => {
    it("given one adjacent space has low flexibility friendly unit, returns true", () => {
      const lowFlexibility = Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const gameState = createGameState([
        {
          coord: "E-5",
          player: "black",
          facing: "northEast",
          flexibility: lowFlexibility,
        },
        {
          coord: "E-6",
          player: "black",
          facing: "north",
          flexibility: lowFlexibility,
        },
      ]);
      expect(checkDiagonalMove("black", lowFlexibility, gameState, "E-5", "D-6", "northEast")).toBe(
        true,
      );
    });
    it("given both adjacent spaces have low flexibility friendly units, returns false", () => {
      const lowFlexibility = Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const gameState = createGameState([
        {
          coord: "E-5",
          player: "black",
          facing: "northEast",
          flexibility: lowFlexibility,
        },
        {
          coord: "D-5",
          player: "black",
          facing: "north",
          flexibility: lowFlexibility,
        },
        {
          coord: "E-6",
          player: "black",
          facing: "north",
          flexibility: lowFlexibility,
        },
      ]);
      expect(checkDiagonalMove("black", lowFlexibility, gameState, "E-5", "D-6", "northEast")).toBe(
        false,
      );
    });
    it("given both adjacent spaces have high flexibility friendly units, returns true", () => {
      const highFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const gameState = createGameState([
        {
          coord: "E-5",
          player: "black",
          facing: "northEast",
          flexibility: highFlexibility,
        },
        {
          coord: "D-5",
          player: "black",
          facing: "north",
          flexibility: highFlexibility,
        },
        {
          coord: "E-6",
          player: "black",
          facing: "north",
          flexibility: highFlexibility,
        },
      ]);
      expect(
        checkDiagonalMove("black", highFlexibility, gameState, "E-5", "D-6", "northEast"),
      ).toBe(true);
    });
    it("given one adjacent space has low flexibility friendly unit and the other has high flexibility friendly unit, returns true", () => {
      const lowFlexibility = Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const highFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const middleFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2);
      const gameState = createGameState([
        {
          coord: "E-5",
          player: "black",
          facing: "northEast",
          flexibility: middleFlexibility,
        },
        {
          coord: "D-5",
          player: "black",
          facing: "north",
          flexibility: lowFlexibility,
        },
        {
          coord: "E-6",
          player: "black",
          facing: "north",
          flexibility: highFlexibility,
        },
      ]);
      expect(
        checkDiagonalMove("black", middleFlexibility, gameState, "E-5", "D-6", "northEast"),
      ).toBe(true);
    });
  });
});
