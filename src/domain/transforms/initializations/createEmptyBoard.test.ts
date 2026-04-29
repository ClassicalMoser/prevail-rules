import { describe, expect, it } from "vitest";
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from "./createEmptyBoard";

/**
 * createEmptyStandardBoard: Creates an empty board space with default values.
 */
describe("createEmptyStandardBoard", () => {
  it("given defaults, creates an empty standard board", () => {
    const board = createEmptyStandardBoard();
    expect(board.boardType).toBe("standard");
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });
});

describe("createEmptySmallBoard", () => {
  it("given defaults, creates an empty small board", () => {
    const board = createEmptySmallBoard();
    expect(board.boardType).toBe("small");
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });
});

describe("createEmptyLargeBoard", () => {
  it("given defaults, creates an empty large board", () => {
    const board = createEmptyLargeBoard();
    expect(board.boardType).toBe("large");
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });
});
