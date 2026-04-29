import type { SmallBoard, StandardBoard } from "@entities";
import { createEmptySmallBoard, createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getBoardCoordinates } from "./getBoardCoordinates";

const standardBoardCoordinateRegex = /^[A-L]-\d+$/;
const smallBoardCoordinateRegex = /^[A-H]-\d+$/;

/**
 * getBoardCoordinates: flat list of every coordinate key on the board (standard 12×18; small 8×12).
 */
describe("getBoardCoordinates", () => {
  describe("standard board", () => {
    it("given standard board, returns 216 coordinates", () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      expect(coordinates.length).toBe(216);
    });

    it("given standard board, includes corners A-1, A-18, L-1, L-18", () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain("A-1");
      expect(coordinates).toContain("A-18");
      expect(coordinates).toContain("L-1");
      expect(coordinates).toContain("L-18");
    });

    it("given standard board, includes interior samples", () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain("E-5");
      expect(coordinates).toContain("F-9");
    });

    it("given readonly tuple, runtime allows push (TS readonly only)", () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(() => {
        (coordinates as string[]).push("invalid");
      }).not.toThrow();
    });
  });

  describe("small board", () => {
    it("given small board, returns 96 coordinates", () => {
      const board: SmallBoard = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      expect(coordinates.length).toBe(96);
    });

    it("given small board, includes corners A-1, A-12, H-1, H-12", () => {
      const board: SmallBoard = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain("A-1");
      expect(coordinates).toContain("A-12");
      expect(coordinates).toContain("H-1");
      expect(coordinates).toContain("H-12");
    });
  });

  describe("type safety", () => {
    it("given standard board, every entry matches standard coordinate pattern", () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      coordinates.forEach((coord) => {
        expect(typeof coord).toBe("string");
        expect(coord).toMatch(standardBoardCoordinateRegex);
      });
    });

    it("given small board, every entry matches small coordinate pattern", () => {
      const board: SmallBoard = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      coordinates.forEach((coord) => {
        expect(typeof coord).toBe("string");
        expect(coord).toMatch(smallBoardCoordinateRegex);
      });
    });
  });
});
