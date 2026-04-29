import type { Board } from "@entities";
import type { MoveUnitEvent } from "@events";
import { createEmptyGameState, createTestUnit } from "@testing";
import { addUnitToBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { isLegalMove } from "./isLegalMove";

/**
 * isLegalMove: Validates whether a unit move event is legal according to game rules.
 */
describe("isLegalMove", () => {
  describe("core functionality", () => {
    it("given a legal move, returns true", () => {
      const unitInstance = createTestUnit("black", { speed: 2 });
      const gameState = createEmptyGameState();
      let board = gameState.boardState;
      board = addUnitToBoard(board, {
        boardType: "standard" as const,
        unit: unitInstance,
        placement: {
          boardType: "standard" as const,
          coordinate: "E-5",
          facing: "north",
        },
      });
      gameState.boardState = board;
      const moveUnitEvent: MoveUnitEvent<Board> = {
        eventNumber: 0,
        eventType: "playerChoice",
        choiceType: "moveUnit",
        boardType: "standard",
        player: "black",
        unit: {
          boardType: "standard" as const,
          unit: unitInstance,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-5",
            facing: "north",
          },
        },
        to: {
          boardType: "standard" as const,
          coordinate: "E-4",
          facing: "north",
        },
        moveCommander: false,
      };
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(true);
    });
  });
  describe("bad inputs", () => {
    it("given a move that is not legal, returns false", () => {
      const unitInstance = createTestUnit("black", { speed: 2 });
      const gameState = createEmptyGameState();
      const moveUnitEvent: MoveUnitEvent<Board> = {
        eventNumber: 0,
        eventType: "playerChoice",
        choiceType: "moveUnit",
        boardType: "standard",
        player: "black",
        unit: {
          boardType: "standard" as const,
          unit: unitInstance,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-5",
            facing: "north",
          },
        },
        to: {
          boardType: "standard" as const,
          coordinate: "E-6",
          facing: "north",
        },
        moveCommander: false,
      };
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(false);
    });
  });
});
