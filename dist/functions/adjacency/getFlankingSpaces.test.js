import { describe, expect, it } from "vitest";
import { getFlankingSpaces } from "./getFlankingSpaces.js";
describe("getFlankingSpaces", () => {
    it("should return the flanking spaces for orthogonal facing directions", () => {
        // For north facing, flanking spaces are west and east (orthogonal to north)
        expect(getFlankingSpaces("E5", "north")).toEqual(new Set(["E4", "E6"]));
        // For east facing, flanking spaces are north and south (orthogonal to east)
        expect(getFlankingSpaces("E5", "east")).toEqual(new Set(["D5", "F5"]));
        // For south facing, flanking spaces are east and west (orthogonal to south)
        expect(getFlankingSpaces("E5", "south")).toEqual(new Set(["E6", "E4"]));
        // For west facing, flanking spaces are south and north (orthogonal to west)
        expect(getFlankingSpaces("E5", "west")).toEqual(new Set(["F5", "D5"]));
    });
    it("should return the flanking spaces for diagonal facing directions", () => {
        // For northEast facing, flanking spaces are northWest and southEast
        expect(getFlankingSpaces("E5", "northEast")).toEqual(new Set(["D4", "F6"]));
        // For southEast facing, flanking spaces are northEast and southWest
        expect(getFlankingSpaces("E5", "southEast")).toEqual(new Set(["D6", "F4"]));
        // For southWest facing, flanking spaces are southEast and northWest
        expect(getFlankingSpaces("E5", "southWest")).toEqual(new Set(["F6", "D4"]));
        // For northWest facing, flanking spaces are southWest and northEast
        expect(getFlankingSpaces("E5", "northWest")).toEqual(new Set(["F4", "D6"]));
    });
    it("should filter out out-of-bounds spaces", () => {
        // At corner A1 facing north, flanking spaces are west and east (west is out of bounds)
        expect(getFlankingSpaces("A1", "north")).toEqual(new Set(["A2"]));
        // At corner A1 facing east, flanking spaces are north and south (north is out of bounds)
        expect(getFlankingSpaces("A1", "east")).toEqual(new Set(["B1"]));
        // At corner L18 facing south, flanking spaces are east and west (east is out of bounds)
        expect(getFlankingSpaces("L18", "south")).toEqual(new Set(["L17"]));
        // At corner L18 facing west, flanking spaces are south and north (south is out of bounds)
        expect(getFlankingSpaces("L18", "west")).toEqual(new Set(["K18"]));
    });
    it("should return empty array if both flanking spaces are out of bounds", () => {
        expect(getFlankingSpaces("A1", "northWest")).toEqual(new Set([]));
        expect(getFlankingSpaces("L1", "southWest")).toEqual(new Set([]));
    });
    it("should throw an error if the row is invalid", () => {
        expect(() => getFlankingSpaces("R12", "north")).toThrow(new Error("Invalid row: R"));
    });
    it("should throw an error if the column is invalid", () => {
        expect(() => getFlankingSpaces("A19", "north")).toThrow(new Error("Invalid column: 19"));
    });
    it("should throw an error if the facing is invalid", () => {
        expect(() => getFlankingSpaces("E9", "random")).toThrow(new Error("Invalid facing: random"));
    });
});
