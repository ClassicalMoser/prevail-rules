import { describe, expect, it } from "vitest";
import { createEmptySmallBoard, createEmptyStandardBoard, } from "../createEmptyBoard.js";
import { getForwardSpace } from "./getForwardSpace.js";
const standardBoard = createEmptyStandardBoard();
const smallBoard = createEmptySmallBoard();
describe("getForwardSpace", () => {
    describe("standard board", () => {
        it("should return the forward space when facing south from A1", () => {
            expect(getForwardSpace(standardBoard, "A-1", "south")).toBe("B-1");
        });
        it("should return the forward space when facing east from A1", () => {
            expect(getForwardSpace(standardBoard, "A-1", "east")).toBe("A-2");
        });
        it("should return the forward space when facing west from E5", () => {
            expect(getForwardSpace(standardBoard, "E-5", "west")).toBe("E-4");
        });
        it("should return the forward space when facing north from G10", () => {
            expect(getForwardSpace(standardBoard, "G-10", "north")).toBe("F-10");
        });
        it("should return the forward space when facing southEast from A1", () => {
            expect(getForwardSpace(standardBoard, "A-1", "southEast")).toBe("B-2");
        });
        it("should return the forward space when facing southWest from D4", () => {
            expect(getForwardSpace(standardBoard, "D-4", "southWest")).toBe("E-3");
        });
        it("should return the forward space when facing northEast from K11", () => {
            expect(getForwardSpace(standardBoard, "K-11", "northEast")).toBe("J-12");
        });
        it("should return the forward space when facing northWest from L18", () => {
            expect(getForwardSpace(standardBoard, "L-18", "northWest")).toBe("K-17");
        });
        it("should return undefined when facing north from A1 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "A-1", "north")).toBeUndefined();
        });
        it("should return undefined when facing west from F1 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "F-1", "west")).toBeUndefined();
        });
        it("should return undefined when facing south from L5 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "L-5", "south")).toBeUndefined();
        });
        it("should return undefined when facing east from E18 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "E-18", "east")).toBeUndefined();
        });
        it("should return undefined when facing northWest from A1 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "A-1", "northWest")).toBeUndefined();
        });
        it("should return undefined when facing northEast from A18 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "A-18", "northEast")).toBeUndefined();
        });
        it("should return undefined when facing southWest from L1 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "L-1", "southWest")).toBeUndefined();
        });
        it("should return undefined when facing southEast from L18 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "L-18", "southEast")).toBeUndefined();
        });
        it("should return undefined when facing northWest from F1 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "F-1", "northWest")).toBeUndefined();
        });
        it("should return undefined when facing northEast from E18 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "E-18", "northEast")).toBeUndefined();
        });
        it("should return undefined when facing southWest from L5 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "L-5", "southWest")).toBeUndefined();
        });
        it("should return undefined when facing northWest from E1 (out of bounds)", () => {
            expect(getForwardSpace(standardBoard, "E-1", "northWest")).toBeUndefined();
        });
        it("should throw an error if the row is invalid", () => {
            expect(() => getForwardSpace(standardBoard, "R-12", "north")).toThrow(new Error("Invalid row: R"));
        });
        it("should throw an error if the column is invalid", () => {
            expect(() => getForwardSpace(standardBoard, "A-19", "north")).toThrow(new Error("Invalid column: 19"));
        });
        it("should throw an error if the facing is invalid", () => {
            expect(() => getForwardSpace(standardBoard, "E-9", "random")).toThrow(new Error("Invalid facing: random"));
        });
    });
    describe("small board", () => {
        it("should return the forward space when facing south from A-1", () => {
            expect(getForwardSpace(smallBoard, "A-1", "south")).toBe("B-1");
        });
        it("should return the forward space when facing east from A-1", () => {
            expect(getForwardSpace(smallBoard, "A-1", "east")).toBe("A-2");
        });
        it("should return the forward space when facing west from E-5", () => {
            expect(getForwardSpace(smallBoard, "E-5", "west")).toBe("E-4");
        });
        it("should return the forward space when facing north from G-10", () => {
            expect(getForwardSpace(smallBoard, "G-10", "north")).toBe("F-10");
        });
        it("should return the forward space when facing southEast from A-1", () => {
            expect(getForwardSpace(smallBoard, "A-1", "southEast")).toBe("B-2");
        });
        it("should return the forward space when facing southWest from D-4", () => {
            expect(getForwardSpace(smallBoard, "D-4", "southWest")).toBe("E-3");
        });
        it("should return the forward space when facing northEast from H-11", () => {
            expect(getForwardSpace(smallBoard, "H-11", "northEast")).toBe("G-12");
        });
        it("should return the forward space when facing northWest from H-12", () => {
            expect(getForwardSpace(smallBoard, "H-12", "northWest")).toBe("G-11");
        });
        // Edge cases at H (last row in small board, vs L in standard)
        it("should return undefined when facing south from H-5 (out of bounds - H is last row)", () => {
            expect(getForwardSpace(smallBoard, "H-5", "south")).toBeUndefined();
        });
        it("should return undefined when facing southEast from H-10 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "H-10", "southEast")).toBeUndefined();
        });
        it("should return undefined when facing southWest from H-3 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "H-3", "southWest")).toBeUndefined();
        });
        // Edge cases at column 12 (last column in small board, vs 18 in standard)
        it("should return undefined when facing east from E-12 (out of bounds - 12 is last column)", () => {
            expect(getForwardSpace(smallBoard, "E-12", "east")).toBeUndefined();
        });
        it("should return undefined when facing northEast from A-12 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "A-12", "northEast")).toBeUndefined();
        });
        it("should return undefined when facing southEast from D-12 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "D-12", "southEast")).toBeUndefined();
        });
        // Corner cases at H-12 (bottom-right corner in small board, vs L-18 in standard)
        it("should return undefined when facing south from H-12 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "H-12", "south")).toBeUndefined();
        });
        it("should return undefined when facing east from H-12 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "H-12", "east")).toBeUndefined();
        });
        it("should return undefined when facing southEast from H-12 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "H-12", "southEast")).toBeUndefined();
        });
        // Standard boundary cases that also apply to small board
        it("should return undefined when facing north from A-1 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "A-1", "north")).toBeUndefined();
        });
        it("should return undefined when facing west from F-1 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "F-1", "west")).toBeUndefined();
        });
        it("should return undefined when facing northWest from A-1 (out of bounds)", () => {
            expect(getForwardSpace(smallBoard, "A-1", "northWest")).toBeUndefined();
        });
        it("should return undefined when facing southWest from H-1 (out of bounds - small board edge)", () => {
            expect(getForwardSpace(smallBoard, "H-1", "southWest")).toBeUndefined();
        });
        // Validation tests - rows I, J, K, L don't exist in small board
        it("should throw an error if the row is invalid (I doesn't exist in small board)", () => {
            expect(() => getForwardSpace(smallBoard, "I-5", "north")).toThrow(new Error("Invalid row: I"));
        });
        it("should throw an error if the row is invalid (L doesn't exist in small board)", () => {
            expect(() => getForwardSpace(smallBoard, "L-5", "north")).toThrow(new Error("Invalid row: L"));
        });
        // Validation tests - columns 13-18 don't exist in small board
        it("should throw an error if the column is invalid (13 doesn't exist in small board)", () => {
            expect(() => getForwardSpace(smallBoard, "A-13", "north")).toThrow(new Error("Invalid column: 13"));
        });
        it("should throw an error if the column is invalid (18 doesn't exist in small board)", () => {
            expect(() => getForwardSpace(smallBoard, "A-18", "north")).toThrow(new Error("Invalid column: 18"));
        });
        it("should throw an error if the facing is invalid", () => {
            expect(() => getForwardSpace(smallBoard, "E-9", "random")).toThrow(new Error("Invalid facing: random"));
        });
    });
});
