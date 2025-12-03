import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from "@functions/createEmptyBoard";
import { describe, expect, it } from "vitest";

describe("createEmptyStandardBoard", () => {
  it("should create an empty standard board", () => {
    const board = createEmptyStandardBoard();
    expect(board.boardType).toBe("standard");
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });
});

describe("createEmptySmallBoard", () => {
  it("should create an empty small board", () => {
    const board = createEmptySmallBoard();
    expect(board.boardType).toBe("small");
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });
});

describe("createEmptyLargeBoard", () => {
  it("should create an empty large board", () => {
    const board = createEmptyLargeBoard();
    expect(board.boardType).toBe("large");
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });
});
