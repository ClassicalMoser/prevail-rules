import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../createEmptyBoard.js";
import { getForwardSpacesToEdge } from "./getForwardSpacesToEdge.js";
const standardBoard = createEmptyStandardBoard();
describe("getForwardSpacesToEdge", () => {
    it("should return the forward spaces to the edge when facing south from A1", () => {
        expect(getForwardSpacesToEdge(standardBoard, "A-1", "south")).toEqual(new Set([
            "B-1",
            "C-1",
            "D-1",
            "E-1",
            "F-1",
            "G-1",
            "H-1",
            "I-1",
            "J-1",
            "K-1",
            "L-1",
        ]));
    });
    it("should return the forward spaces to the edge when facing east from E5", () => {
        expect(getForwardSpacesToEdge(standardBoard, "E-5", "east")).toEqual(new Set([
            "E-6",
            "E-7",
            "E-8",
            "E-9",
            "E-10",
            "E-11",
            "E-12",
            "E-13",
            "E-14",
            "E-15",
            "E-16",
            "E-17",
            "E-18",
        ]));
    });
    it("should return the forward spaces to the edge when facing northEast from E5", () => {
        expect(getForwardSpacesToEdge(standardBoard, "E-5", "northEast")).toEqual(new Set(["D-6", "C-7", "B-8", "A-9"]));
    });
    it("should return the forward spaces to the edge when facing southEast from E5", () => {
        expect(getForwardSpacesToEdge(standardBoard, "E-5", "southEast")).toEqual(new Set(["F-6", "G-7", "H-8", "I-9", "J-10", "K-11", "L-12"]));
    });
    it("should return the forward spaces to the edge when facing southWest from G9", () => {
        expect(getForwardSpacesToEdge(standardBoard, "G-9", "southWest")).toEqual(new Set(["H-8", "I-7", "J-6", "K-5", "L-4"]));
    });
    it("should return the forward spaces to the edge when facing northWest from G9", () => {
        expect(getForwardSpacesToEdge(standardBoard, "G-9", "northWest")).toEqual(new Set(["F-8", "E-7", "D-6", "C-5", "B-4", "A-3"]));
    });
});
