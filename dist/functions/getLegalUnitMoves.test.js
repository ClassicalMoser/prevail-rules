import { tempUnits } from "src/sampleValues/tempUnits.js";
import { hasMove } from "src/testing/testHelpers.js";
import { createUnitInstance } from "src/utils/createUnitInstance.js";
import { describe, expect, it } from "vitest";
import { createBoardWithUnits } from "./createBoard.js";
import { createEmptyStandardBoard } from "./createEmptyBoard.js";
import { getLegalUnitMoves } from "./getLegalUnitMoves.js";
describe("getLegalUnitMoves", () => {
    const spearmenUnitType = tempUnits.find((unit) => unit.name === "Spearmen");
    if (!spearmenUnitType) {
        throw new Error("Spearmen unit type not found");
    }
    describe("spearmen unit on blank board", () => {
        it("should return legal moves for a spearmen unit at center of board facing north", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
            ]);
            const legalMoves = getLegalUnitMoves(unit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            // Spearmen have speed 2 and flexibility 1
            expect(legalMoves.size).toBeGreaterThan(0);
            expect(hasMove(legalMoves, startingCoordinate, startingFacing)).toBe(true);
        });
    });
    describe("with friendly units on board", () => {
        it("should not be able to move through friendly unit with insufficient flexibility", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            // Spearmen have flexibility 1, so combined flexibility would be 2 (need 4+)
            const friendlyUnit = createUnitInstance("black", spearmenUnitType, 2);
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
                { unit: friendlyUnit, coordinate: "D-5", facing: "north" },
            ]);
            const legalMoves = getLegalUnitMoves(unit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            expect(hasMove(legalMoves, "D-5")).toBe(false);
            expect(hasMove(legalMoves, "C-5")).toBe(false);
        });
        it("should be able to move through friendly unit with sufficient flexibility", () => {
            const highFlexibilityUnitType = tempUnits.find((unit) => unit.flexibility === 2);
            if (!highFlexibilityUnitType) {
                throw new Error("Unit with flexibility 2 not found");
            }
            const unit = createUnitInstance("black", highFlexibilityUnitType, 1);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            // Combined flexibility = 2 + 2 = 4, which is sufficient
            const friendlyUnit = createUnitInstance("black", highFlexibilityUnitType, 2);
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
                { unit: friendlyUnit, coordinate: "D-5", facing: "north" },
            ]);
            const legalMoves = getLegalUnitMoves(unit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            expect(hasMove(legalMoves, "C-5")).toBe(true);
        });
    });
    describe("with enemy units on board", () => {
        it("should be able to engage enemy unit from flank", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-4";
            const startingFacing = "east";
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
                { unit: enemyUnit, coordinate: "E-5", facing: "north" },
            ]);
            const legalMoves = getLegalUnitMoves(unit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            expect(hasMove(legalMoves, "E-5")).toBe(true);
        });
        it("should be able to engage enemy unit from front with correct facing", () => {
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "D-5";
            const startingFacing = "south";
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
                { unit: enemyUnit, coordinate: "E-5", facing: "north" },
            ]);
            const legalMoves = getLegalUnitMoves(unit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            expect(hasMove(legalMoves, "E-5")).toBe(true);
        });
        it("should be able to engage enemy unit from front with flexibility to rotate", () => {
            const flexibleUnitType = tempUnits.find((unit) => unit.flexibility === 2);
            if (!flexibleUnitType) {
                throw new Error("Unit with flexibility 2 not found");
            }
            const unit = createUnitInstance("black", flexibleUnitType, 1);
            const startingCoordinate = "D-5";
            const startingFacing = "east";
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
                { unit: enemyUnit, coordinate: "E-5", facing: "north" },
            ]);
            const legalMoves = getLegalUnitMoves(unit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            expect(hasMove(legalMoves, "E-5", "south")).toBe(true);
        });
        it("should not be able to move through enemy unit", () => {
            const friendlyUnit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            const enemyUnit1 = createUnitInstance("white", spearmenUnitType, 1);
            const enemyUnit2 = createUnitInstance("white", spearmenUnitType, 2);
            const enemyUnit3 = createUnitInstance("white", spearmenUnitType, 3);
            const board = createBoardWithUnits([
                {
                    unit: friendlyUnit,
                    coordinate: startingCoordinate,
                    facing: startingFacing,
                },
                { unit: enemyUnit1, coordinate: "D-4", facing: "south" },
                { unit: enemyUnit2, coordinate: "D-5", facing: "south" },
                { unit: enemyUnit3, coordinate: "D-6", facing: "south" },
            ]);
            const legalMoves = getLegalUnitMoves(friendlyUnit, board, {
                coordinate: startingCoordinate,
                facing: startingFacing,
            });
            // Cannot move through enemy unit
            expect(hasMove(legalMoves, "C-5")).toBe(false);
            // Can move into enemy unit
            expect(hasMove(legalMoves, "D-5", "north")).toBe(true);
            // Cannot move into enemy unit with incorrect facing
            expect(hasMove(legalMoves, "D-5", "east")).toBe(false);
            // Cannot move into enemy unit with incorrect facing
            expect(hasMove(legalMoves, "D-5", "southWest")).toBe(false);
        });
    });
    describe("error cases for invalid starting position", () => {
        it("should throw error when unit at starting position is not free to move (engaged)", () => {
            // Test coverage for lines 29-30: unit is not free to move (engaged state)
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            const enemyUnit = createUnitInstance("white", spearmenUnitType, 2);
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: startingFacing },
                { unit: enemyUnit, coordinate: startingCoordinate, facing: "south" },
            ]);
            // Manually set the unit presence to engaged state
            board.board[startingCoordinate].unitPresence = {
                presenceType: "engaged",
                primaryUnit: unit,
                primaryFacing: startingFacing,
                secondaryUnit: enemyUnit,
            };
            expect(() => {
                getLegalUnitMoves(unit, board, {
                    coordinate: startingCoordinate,
                    facing: startingFacing,
                });
            }).toThrow(new Error("Unit at starting position is not free to move"));
        });
        it("should throw error when unit at starting position is not free to move (none presence)", () => {
            // Test coverage for lines 29-30: unit is not free to move (none presence type)
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            const board = createEmptyStandardBoard();
            // Set unit presence to "none" instead of "single"
            board.board[startingCoordinate].unitPresence = {
                presenceType: "none",
            };
            expect(() => {
                getLegalUnitMoves(unit, board, {
                    coordinate: startingCoordinate,
                    facing: startingFacing,
                });
            }).toThrow(new Error("Unit at starting position is not free to move"));
        });
        it("should throw error when unit is not present at the starting position", () => {
            // Test coverage for lines 33-34: unit mismatch at starting position
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const differentUnit = createUnitInstance("black", spearmenUnitType, 2);
            const startingCoordinate = "E-5";
            const startingFacing = "north";
            const board = createBoardWithUnits([
                {
                    unit: differentUnit,
                    coordinate: startingCoordinate,
                    facing: startingFacing,
                },
            ]);
            expect(() => {
                getLegalUnitMoves(unit, board, {
                    coordinate: startingCoordinate,
                    facing: startingFacing,
                });
            }).toThrow(new Error("Unit is not present at the starting position"));
        });
        it("should throw error when reported facing is inaccurate", () => {
            // Test coverage for lines 37-38: facing mismatch at starting position
            const unit = createUnitInstance("black", spearmenUnitType, 1);
            const startingCoordinate = "E-5";
            const actualFacing = "north";
            const reportedFacing = "south"; // Different from actual facing
            const board = createBoardWithUnits([
                { unit, coordinate: startingCoordinate, facing: actualFacing },
            ]);
            expect(() => {
                getLegalUnitMoves(unit, board, {
                    coordinate: startingCoordinate,
                    facing: reportedFacing,
                });
            }).toThrow(new Error("Reported facing is inaccurate"));
        });
    });
});
