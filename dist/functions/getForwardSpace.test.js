import { describe, expect, it } from "vitest";
import { getForwardSpace } from "./getForwardSpace.js";
describe("getForwardSpace", () => {
    it("should return the forward space when facing south from A1", () => {
        expect(getForwardSpace("A1", "south")).toBe("B1");
    });
    it("should return the forward space when facing east from A1", () => {
        expect(getForwardSpace("A1", "east")).toBe("A2");
    });
    it("should return the forward space when facing west from E5", () => {
        expect(getForwardSpace("E5", "west")).toBe("E4");
    });
    it("should return the forward space when facing north from G10", () => {
        expect(getForwardSpace("G10", "north")).toBe("F10");
    });
    it("should return the forward space when facing southEast from A1", () => {
        expect(getForwardSpace("A1", "southEast")).toBe("B2");
    });
    it("should return the forward space when facing southWest from D4", () => {
        expect(getForwardSpace("D4", "southWest")).toBe("E3");
    });
    it("should return the forward space when facing northEast from K11", () => {
        expect(getForwardSpace("K11", "northEast")).toBe("J12");
    });
    it("should return the forward space when facing northWest from L18", () => {
        expect(getForwardSpace("L18", "northWest")).toBe("K17");
    });
    it("should return undefined when facing north from A1 (out of bounds)", () => {
        expect(getForwardSpace("A1", "north")).toBeUndefined();
    });
    it("should return undefined when facing west from F1 (out of bounds)", () => {
        expect(getForwardSpace("F1", "west")).toBeUndefined();
    });
    it("should return undefined when facing south from L5 (out of bounds)", () => {
        expect(getForwardSpace("L5", "south")).toBeUndefined();
    });
    it("should return undefined when facing east from E18 (out of bounds)", () => {
        expect(getForwardSpace("E18", "east")).toBeUndefined();
    });
    it("should return undefined when facing northWest from A1 (out of bounds)", () => {
        expect(getForwardSpace("A1", "northWest")).toBeUndefined();
    });
    it("should return undefined when facing northEast from A18 (out of bounds)", () => {
        expect(getForwardSpace("A18", "northEast")).toBeUndefined();
    });
    it("should return undefined when facing southWest from L1 (out of bounds)", () => {
        expect(getForwardSpace("L1", "southWest")).toBeUndefined();
    });
    it("should return undefined when facing southEast from L18 (out of bounds)", () => {
        expect(getForwardSpace("L18", "southEast")).toBeUndefined();
    });
    it("should return undefined when facing northWest from F1 (out of bounds)", () => {
        expect(getForwardSpace("F1", "northWest")).toBeUndefined();
    });
    it("should return undefined when facing northEast from E18 (out of bounds)", () => {
        expect(getForwardSpace("E18", "northEast")).toBeUndefined();
    });
    it("should return undefined when facing southWest from L5 (out of bounds)", () => {
        expect(getForwardSpace("L5", "southWest")).toBeUndefined();
    });
    it("should return undefined when facing northWest from E1 (out of bounds)", () => {
        expect(getForwardSpace("E1", "northWest")).toBeUndefined();
    });
    it("should throw an error if the row is invalid", () => {
        expect(() => getForwardSpace("R12", "north")).toThrow(new Error("Invalid row: R"));
    });
    it("should throw an error if the column is invalid", () => {
        expect(() => getForwardSpace("A19", "north")).toThrow(new Error("Invalid column: 19"));
    });
    it("should throw an error if the facing is invalid", () => {
        expect(() => getForwardSpace("E9", "random")).toThrow(new Error("Invalid facing: random"));
    });
});
