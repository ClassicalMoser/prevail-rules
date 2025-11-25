import { smallBoardSchema, standardBoardSchema } from "src/entities/index.js";
import { describe, expect, it } from "vitest";
import { createEmptySmallBoard, createEmptyStandardBoard, } from "./createEmptyBoard.js";
describe("createEmptyStandardBoard", () => {
    it("should create an empty standard board", () => {
        const board = createEmptyStandardBoard();
        const boardSchema = standardBoardSchema.safeParse(board);
        expect(boardSchema.success).toBe(true);
    });
});
describe("createEmptySmallBoard", () => {
    it("should create an empty small board", () => {
        const board = createEmptySmallBoard();
        const boardSchema = smallBoardSchema.safeParse(board);
        expect(boardSchema.success).toBe(true);
    });
});
