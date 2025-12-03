import type { MoveCommanderCommand } from "@commands/moveCommander.js";
import type { StandardBoardCoordinate } from "@entities/index.js";
import { createEmptyStandardBoard } from "@functions/createEmptyBoard.js";
import { createBoardWithCommander } from "@testing/createBoard.js";
import { isLegalCommanderMove } from "@validation/isLegalCommanderMove.js";
import { describe, expect, it } from "vitest";

describe("valid moves", () => {
  it("should return true when commander moves within distance 1", () => {
    const board = createBoardWithCommander("black", "E-5");
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "E-6", // Adjacent space
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(true);
  });

  it("should return true when commander moves within distance 4", () => {
    const board = createBoardWithCommander("black", "E-5");
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "E-9", // Exactly 4 spaces away
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(true);
  });

  it("should return true when white commander moves within distance", () => {
    const board = createBoardWithCommander("white", "F-6");
    const moveCommand: MoveCommanderCommand = {
      player: "white",
      from: "F-6",
      to: "F-5", // Adjacent space
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(true);
  });

  it("should return true when commander moves diagonally within distance", () => {
    const board = createBoardWithCommander("black", "E-5");
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "D-4", // Diagonal, distance 1
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(true);
  });
});

describe("invalid moves", () => {
  it("should return false when commander is not at starting position", () => {
    const board = createEmptyStandardBoard(); // No commander on board
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "E-6",
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(false);
  });

  it("should return false when wrong player's commander is at starting position", () => {
    const board = createBoardWithCommander("white", "E-5"); // White commander, not black
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "E-6",
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(false);
  });

  it("should return false when destination is beyond move distance", () => {
    const board = createBoardWithCommander("black", "E-5");
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "E-10", // 5 spaces away, beyond COMMANDER_MOVE_DISTANCE (4)
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(false);
  });

  it("should return false when starting coordinate is invalid", () => {
    const board = createEmptyStandardBoard();
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "Z-99" as StandardBoardCoordinate, // Invalid coordinate
      to: "E-5",
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(false);
  });

  it("should return false when destination coordinate is invalid", () => {
    const board = createBoardWithCommander("black", "E-5");
    const moveCommand: MoveCommanderCommand = {
      player: "black",
      from: "E-5",
      to: "Z-99" as StandardBoardCoordinate, // Invalid coordinate
    };

    const result = isLegalCommanderMove(moveCommand, board);

    expect(result).toBe(false);
  });
});
