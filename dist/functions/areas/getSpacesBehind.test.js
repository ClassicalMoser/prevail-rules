import { describe, expect, it } from "vitest";
import { getSpacesBehind } from "./getSpacesBehind.js";
describe("getSpacesBehind", () => {
    it("should return the spaces behind when facing east from F2", () => {
        expect(getSpacesBehind("F2", "east")).toEqual(new Set([
            "A1",
            "B1",
            "C1",
            "D1",
            "E1",
            "F1",
            "G1",
            "H1",
            "I1",
            "J1",
            "K1",
            "L1",
        ]));
    });
    it("should return the spaces behind when facing south from B7", () => {
        expect(getSpacesBehind("B7", "south")).toEqual(new Set([
            "A1",
            "A2",
            "A3",
            "A4",
            "A5",
            "A6",
            "A7",
            "A8",
            "A9",
            "A10",
            "A11",
            "A12",
            "A13",
            "A14",
            "A15",
            "A16",
            "A17",
            "A18",
        ]));
    });
    it("should return the spaces behind when facing west from F16", () => {
        expect(getSpacesBehind("F16", "west")).toEqual(new Set([
            "A17",
            "A18",
            "B17",
            "B18",
            "C17",
            "C18",
            "D17",
            "D18",
            "E17",
            "E18",
            "F17",
            "F18",
            "G17",
            "G18",
            "H17",
            "H18",
            "I17",
            "I18",
            "J17",
            "J18",
            "K17",
            "K18",
            "L17",
            "L18",
        ]));
    });
    it("should return the spaces behind when facing southEast from B2", () => {
        expect(getSpacesBehind("B2", "southEast")).toEqual(new Set(["A1", "B1", "A2"]));
    });
    it("should return the spaces behind when facing northEast from J3", () => {
        expect(getSpacesBehind("J3", "northEast")).toEqual(new Set(["I1", "J1", "J2", "K1", "K2", "K3", "L1", "L2", "L3", "L4"]));
    });
});
