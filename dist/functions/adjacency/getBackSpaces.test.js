import { describe, expect, it } from "vitest";
import { getBackSpaces } from "./getBackSpaces.js";
describe("getBackSpaces", () => {
    it("should return the back spaces for orthogonal facing directions", () => {
        // For north facing, back spaces are the front spaces when facing south
        expect(getBackSpaces("E5", "north")).toEqual(new Set(["F6", "F4", "F5"]));
        // For east facing, back spaces are the front spaces when facing west
        expect(getBackSpaces("E5", "east")).toEqual(new Set(["F4", "D4", "E4"]));
        // For south facing, back spaces are the front spaces when facing north
        expect(getBackSpaces("E5", "south")).toEqual(new Set(["D4", "D6", "D5"]));
        // For west facing, back spaces are the front spaces when facing east
        expect(getBackSpaces("E5", "west")).toEqual(new Set(["D6", "F6", "E6"]));
    });
    it("should return the back spaces for diagonal facing directions", () => {
        // For northEast facing, back spaces are the front spaces when facing southWest
        expect(getBackSpaces("E5", "northEast")).toEqual(new Set(["F5", "E4", "F4"]));
        // For southEast facing, back spaces are the front spaces when facing northWest
        expect(getBackSpaces("E5", "southEast")).toEqual(new Set(["E4", "D5", "D4"]));
        // For southWest facing, back spaces are the front spaces when facing northEast
        expect(getBackSpaces("E5", "southWest")).toEqual(new Set(["D5", "E6", "D6"]));
        // For northWest facing, back spaces are the front spaces when facing southEast
        expect(getBackSpaces("E5", "northWest")).toEqual(new Set(["E6", "F5", "F6"]));
    });
    it("should filter out out-of-bounds spaces", () => {
        // At corner A1 facing north, back spaces are south (southEast, southWest, south)
        expect(getBackSpaces("A1", "north")).toEqual(new Set(["B2", "B1"]));
        // At corner L18 facing south, back spaces are north (northWest, northEast, north)
        expect(getBackSpaces("L18", "south")).toEqual(new Set(["K17", "K18"]));
    });
    it("should throw an error if the row is invalid", () => {
        expect(() => getBackSpaces("R12", "north")).toThrow(new Error("Invalid row: R"));
    });
    it("should throw an error if the column is invalid", () => {
        expect(() => getBackSpaces("A19", "north")).toThrow(new Error("Invalid column: 19"));
    });
    it("should throw an error if the facing is invalid", () => {
        expect(() => getBackSpaces("E9", "random")).toThrow(new Error("Invalid facing: random"));
    });
});
