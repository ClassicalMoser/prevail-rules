import { tempUnits } from "src/sampleValues/tempUnits.js";
import { createUnitInstance } from "src/utils/createUnitInstance.js";
import { describe, expect, it } from "vitest";
import { createBoardWithUnits } from "../../functions/createBoard.js";
import { isLegalMove } from "./isLegalMove.js";
describe("isLegalMove", () => {
    const spearmenUnitType = tempUnits.find((unit) => unit.name === "Spearmen");
    if (!spearmenUnitType) {
        throw new Error("Spearmen unit type not found");
    }
    describe("valid moves", () => {
        it("should return true for staying in place", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const coordinate = "E-5";
            const facing = "north";
            const board = createBoardWithUnits([{ unit, coordinate, facing }]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate, facing },
                to: { coordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(true);
        });
        it("should return true for moving forward", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "E-5";
            const toCoordinate = "D-5";
            const facing = "north";
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(true);
        });
        it("should return true for changing facing without moving", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const coordinate = "E-5";
            const fromFacing = "north";
            const toFacing = "east";
            const board = createBoardWithUnits([
                { unit, coordinate, facing: fromFacing },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate, facing: fromFacing },
                to: { coordinate, facing: toFacing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(true);
        });
        it("should return true for engaging enemy from flank", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "E-4";
            const toCoordinate = "E-5";
            const facing = "east";
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
                { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(true);
        });
        it("should return true for engaging enemy from front with correct facing", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "D-5";
            const toCoordinate = "E-5";
            const facing = "south"; // Facing opposite to enemy (enemy faces north)
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
                { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(true);
        });
    });
    describe("invalid moves", () => {
        it("should return false for moving to invalid coordinate", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "E-5";
            // Invalid coordinate with intentionally unsafe casting
            const toCoordinate = "Z-99";
            const facing = "north";
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(false);
        });
        it("should return false for moving beyond speed limit", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1); // Speed 2
            const fromCoordinate = "E-5";
            const toCoordinate = "B-5"; // 3 spaces away (beyond speed 2)
            const facing = "north";
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(false);
        });
        it("should return false for moving to friendly unit", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "E-5";
            const toCoordinate = "D-5";
            const facing = "north";
            const friendlyUnit = createUnitInstance("black", spearmenUnitType, 2);
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
                { unit: friendlyUnit, coordinate: toCoordinate, facing },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(false);
        });
        it("should return false for moving through enemy unit", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "E-5";
            const toCoordinate = "C-5"; // Beyond enemy at D-5
            const facing = "north";
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
                { unit: enemyUnit, coordinate: "D-5", facing: "south" },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(false);
        });
        it("should return false for engaging enemy from front with wrong facing", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const fromCoordinate = "D-5";
            const toCoordinate = "E-5";
            const facing = "north"; // Wrong facing (should be south to face opposite enemy)
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
                { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(false);
        });
        it("should return false for engaging enemy from front without flexibility to rotate", () => {
            const lowFlexibilityUnitType = tempUnits.find((unit) => unit.flexibility === 1);
            if (!lowFlexibilityUnitType) {
                throw new Error("Unit with flexibility 0 not found");
            }
            const unit = createUnitInstance("black", lowFlexibilityUnitType, 1);
            const fromCoordinate = "D-5";
            const toCoordinate = "E-5";
            const facing = "east"; // Coming from angle, needs flexibility to rotate
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: fromCoordinate, facing },
                { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
            ]);
            const moveCommand = {
                player: "black",
                unit,
                from: { coordinate: fromCoordinate, facing },
                to: { coordinate: toCoordinate, facing },
            };
            expect(isLegalMove(moveCommand, board)).toBe(false);
        });
    });
});
