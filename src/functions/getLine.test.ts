import type { StandardBoardCoordinate } from "@entities";
import { getLinesFromUnit, getPlayerUnitWithPosition } from "@functions";
import { createBoardWithUnits, createTestUnit, getUnitByTrait } from "@testing";
import { describe, expect, it } from "vitest";

describe("getLinesFromUnit", () => {
  describe("single unit", () => {
    it("should return a single line with just the unit", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const coordinate: StandardBoardCoordinate = "E-5";
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        coordinate,
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(1);
      expect(line.unitPlacements[0]?.unit).toBe(unit);
      expect(line.unitPlacements[0]?.placement.coordinate).toBe(coordinate);
    });
  });

  describe("two units forming a line", () => {
    it("should return a line with both units when they face the same direction", () => {
      const unit1 = createTestUnit("black", { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 });
      // Unit facing north forms line going east-west (perpendicular)
      // So units at E-4 and E-6 are on the same line
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "north" },
        { unit: unit2, coordinate: "E-6", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(2);
      expect(line.unitPlacements[0]?.unit).toBe(unit1);
      expect(line.unitPlacements[1]?.unit).toBe(unit2);
    });

    it("should return a line with both units when they face opposite directions", () => {
      const unit1 = createTestUnit("black", { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 });
      // Unit facing north forms line going east-west (perpendicular)
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "north" },
        { unit: unit2, coordinate: "E-6", facing: "south" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(2);
    });
  });

  describe("multiple units forming a line", () => {
    it("should return a line with all contiguous units (up to 8)", () => {
      const units = Array.from({ length: 5 }, (_, i) =>
        createTestUnit("black", { attack: 3, instanceNumber: i + 1 })
      );
      // Unit facing north forms line going east-west (perpendicular)
      const board = createBoardWithUnits([
        { unit: units[0]!, coordinate: "E-3", facing: "north" },
        { unit: units[1]!, coordinate: "E-4", facing: "north" },
        { unit: units[2]!, coordinate: "E-5", facing: "north" },
        { unit: units[3]!, coordinate: "E-6", facing: "north" },
        { unit: units[4]!, coordinate: "E-7", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(5);
    });

    it("should return a line with exactly 8 units", () => {
      const units = Array.from({ length: 8 }, (_, i) =>
        createTestUnit("black", { attack: 3, instanceNumber: i + 1 })
      );
      const board = createBoardWithUnits([
        { unit: units[0]!, coordinate: "E-1", facing: "north" },
        { unit: units[1]!, coordinate: "E-2", facing: "north" },
        { unit: units[2]!, coordinate: "E-3", facing: "north" },
        { unit: units[3]!, coordinate: "E-4", facing: "north" },
        { unit: units[4]!, coordinate: "E-5", facing: "north" },
        { unit: units[5]!, coordinate: "E-6", facing: "north" },
        { unit: units[6]!, coordinate: "E-7", facing: "north" },
        { unit: units[7]!, coordinate: "E-8", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(8);
    });
  });

  describe("more than 8 units", () => {
    it("should return multiple lines when segment has more than 8 units", () => {
      const units = Array.from({ length: 10 }, (_, i) =>
        createTestUnit("black", { attack: 3, instanceNumber: i + 1 })
      );
      const board = createBoardWithUnits([
        { unit: units[0]!, coordinate: "E-1", facing: "north" },
        { unit: units[1]!, coordinate: "E-2", facing: "north" },
        { unit: units[2]!, coordinate: "E-3", facing: "north" },
        { unit: units[3]!, coordinate: "E-4", facing: "north" },
        { unit: units[4]!, coordinate: "E-5", facing: "north" },
        { unit: units[5]!, coordinate: "E-6", facing: "north" },
        { unit: units[6]!, coordinate: "E-7", facing: "north" },
        { unit: units[7]!, coordinate: "E-8", facing: "north" },
        { unit: units[8]!, coordinate: "E-9", facing: "north" },
        { unit: units[9]!, coordinate: "E-10", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      // Unit at E-5 is at index 4 in the 10-unit segment (indices 0-9)
      // With MAX_LINE_LENGTH=8, we need windows that include index 4
      // minStart = max(0, 4-7) = 0, maxStart = min(4, 10-8) = 2
      // Valid windows: [0-7], [1-8], [2-9] = 3 lines
      expect(lines.size).toBeGreaterThan(1);
      for (const line of lines) {
        expect(line.unitPlacements).toHaveLength(8);
        // Each line should include the unit at E-5
        const hasOurUnit = line.unitPlacements.some(
          (u) =>
            u.unit.instanceNumber === unitWithPlacement.unit.instanceNumber &&
            u.placement.coordinate === "E-5"
        );
        expect(hasOurUnit).toBe(true);
      }
    });
  });

  describe("gaps in line", () => {
    it("should stop at empty space and not include units beyond gap", () => {
      const unit1 = createTestUnit("black", { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 });
      const unit3 = createTestUnit("black", { attack: 3, instanceNumber: 3 });
      // Unit facing north forms line going east-west (perpendicular)
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "north" },
        { unit: unit2, coordinate: "E-6", facing: "north" },
        // Gap at E-7
        { unit: unit3, coordinate: "E-8", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(2);
      expect(line.unitPlacements[0]?.unit).toBe(unit1);
      expect(line.unitPlacements[1]?.unit).toBe(unit2);
    });
  });

  describe("enemy units", () => {
    it("should stop at enemy unit and not include units beyond it", () => {
      const friendlyUnit1 = createTestUnit("black", {
        attack: 3,
        instanceNumber: 1,
      });
      const friendlyUnit2 = createTestUnit("black", {
        attack: 3,
        instanceNumber: 2,
      });
      const enemyUnit = createTestUnit("white", {
        attack: 3,
        instanceNumber: 1,
      });
      const friendlyUnit3 = createTestUnit("black", {
        attack: 3,
        instanceNumber: 3,
      });
      const board = createBoardWithUnits([
        { unit: friendlyUnit1, coordinate: "E-5", facing: "north" },
        { unit: friendlyUnit2, coordinate: "E-6", facing: "north" },
        { unit: enemyUnit, coordinate: "E-7", facing: "north" },
        { unit: friendlyUnit3, coordinate: "E-8", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(2);
      expect(line.unitPlacements[0]?.unit).toBe(friendlyUnit1);
      expect(line.unitPlacements[1]?.unit).toBe(friendlyUnit2);
    });
  });

  describe("wrong facing", () => {
    it("should stop at unit with wrong facing (not same or opposite)", () => {
      const unit1 = createTestUnit("black", { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 });
      const unit3 = createTestUnit("black", { attack: 3, instanceNumber: 3 });
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "north" },
        { unit: unit2, coordinate: "E-6", facing: "north" },
        { unit: unit3, coordinate: "E-7", facing: "east" }, // Wrong facing
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(2);
    });
  });

  describe("trait filtering", () => {
    it("should only include units with required traits", () => {
      const unitTypeWithTrait = getUnitByTrait("mounted");
      const unit1 = createTestUnit("black", {
        unitType: unitTypeWithTrait,
        instanceNumber: 1,
      });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 }); // No mounted trait
      const unit3 = createTestUnit("black", {
        unitType: unitTypeWithTrait,
        instanceNumber: 3,
      });
      // Unit facing north forms line going east-west (perpendicular)
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "north" },
        { unit: unit2, coordinate: "E-6", facing: "north" },
        { unit: unit3, coordinate: "E-7", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement, ["mounted"]);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(1); // Only unit1, unit2 breaks the line
      expect(line.unitPlacements[0]?.unit).toBe(unit1);
    });
  });

  describe("unitType filtering", () => {
    it("should only include units of specified types", () => {
      const unitType1 = getUnitByTrait("mounted");
      const unitType2 = getUnitByTrait("spear");
      const unit1 = createTestUnit("black", {
        unitType: unitType1,
        instanceNumber: 1,
      });
      const unit2 = createTestUnit("black", {
        unitType: unitType2,
        instanceNumber: 2,
      });
      const unit3 = createTestUnit("black", {
        unitType: unitType1,
        instanceNumber: 3,
      });
      // Unit facing north forms line going east-west (perpendicular)
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "north" },
        { unit: unit2, coordinate: "E-6", facing: "north" },
        { unit: unit3, coordinate: "E-7", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement, [], [unitType1]);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(1); // Only unit1, unit2 breaks the line
      expect(line.unitPlacements[0]?.unit).toBe(unit1);
    });
  });

  describe("edge cases", () => {
    it("should handle unit at board edge", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithUnits([
        { unit, coordinate: "A-5", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "A-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      expect(lines).toBeDefined();
    });

    it("should throw error if unit is not at reported placement", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithUnits([
        { unit, coordinate: "E-5", facing: "north" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      // Modify the coordinate to be wrong
      const wrongPlacement = {
        ...unitWithPlacement,
        placement: {
          ...unitWithPlacement.placement,
          coordinate: "A-1" as StandardBoardCoordinate,
        },
      };

      expect(() => getLinesFromUnit(board, wrongPlacement)).toThrow(
        "Unit is not at reported placement"
      );
    });

    it("should handle different facings correctly", () => {
      const unit1 = createTestUnit("black", { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 });
      // Unit facing east forms line going north-south (perpendicular)
      // So units at D-5 and F-5 are on the same line
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: "E-5", facing: "east" },
        { unit: unit2, coordinate: "F-5", facing: "east" },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        "E-5",
        "black"
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);

      expect(lines.size).toBe(1);
      const line = Array.from(lines)[0];
      expect(line.unitPlacements).toHaveLength(2);
    });
  });
});
