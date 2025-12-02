import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitWithPlacement,
} from "src/entities/index.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import { tempUnits } from "src/sampleValues/tempUnits.js";
import { createUnitInstance } from "src/utils/createUnitInstance.js";
import { describe, expect, it } from "vitest";
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
} from "../functions/createBoard.js";
import { createEmptyStandardBoard } from "../functions/createEmptyBoard.js";
import { isAtPlacement } from "./isAtPlacement.js";

describe("isAtPlacement", () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();
  const coordinate: StandardBoardCoordinate = "E-5";

  const spearmenUnitType = tempUnits.find((unit) => unit.name === "Spearmen");
  const swordsmenUnitType = tempUnits.find((unit) => unit.name === "Swordsmen");
  if (!spearmenUnitType || !swordsmenUnitType) {
    throw new Error("Required unit types not found");
  }

  // Helper function to create a unit instance
  const createUnit = (
    playerSide: PlayerSide,
    unitType = spearmenUnitType,
    instanceNumber = 1
  ): UnitInstance => {
    return createUnitInstance(playerSide, unitType, instanceNumber);
  };

  // Helper function to create a UnitWithPlacement
  const createUnitWithPlacement = (
    unit: UnitInstance,
    coord: StandardBoardCoordinate,
    facing: UnitFacing
  ): UnitWithPlacement<StandardBoard> => {
    return {
      unit,
      placement: {
        coordinate: coord,
        facing,
      },
    };
  };

  describe("invalid inputs", () => {
    it("should return false for a non-existent coordinate", () => {
      const unit = createUnit("black");
      const invalidCoordinate = "Z-99" as StandardBoardCoordinate;
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        invalidCoordinate,
        "north"
      );

      expect(isAtPlacement(standardBoard, unitWithPlacement)).toBe(false);
    });
  });

  describe("empty space", () => {
    it("should return false for an empty space with no unit presence", () => {
      const unit = createUnit("black");
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(standardBoard, unitWithPlacement)).toBe(false);
    });
  });

  describe("single friendly unit", () => {
    it("should return true when unit matches exactly", () => {
      const unit = createUnit("black");
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(true);
    });

    it("should return false when facing does not match", () => {
      const unit = createUnit("black");
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        "south"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when playerSide does not match", () => {
      const unit = createUnit("black");
      const differentPlayerUnit = createUnit("white");
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        differentPlayerUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when unitType does not match", () => {
      const unit = createUnit("black", spearmenUnitType);
      const differentTypeUnit = createUnit("black", swordsmenUnitType);
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        differentTypeUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when instanceNumber does not match", () => {
      const unit = createUnit("black", spearmenUnitType, 1);
      const differentInstanceUnit = createUnit("black", spearmenUnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        differentInstanceUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return true when unit matches by value (different object reference)", () => {
      const unit = createUnit("black", spearmenUnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate, facing: "north" },
      ]);
      // Create a new unit instance with the same properties
      const sameUnit = createUnit("black", spearmenUnitType, 1);
      const unitWithPlacement = createUnitWithPlacement(
        sameUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(true);
    });
  });

  describe("single enemy unit", () => {
    it("should return false when unit at coordinate is an enemy", () => {
      const enemyUnit = createUnit("white");
      const friendlyUnit = createUnit("black");
      const board = createBoardWithUnits([
        { unit: enemyUnit, coordinate, facing: "north" },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        friendlyUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });
  });

  describe("engaged units - primary unit is friendly", () => {
    it("should return true when primary unit matches exactly", () => {
      const primaryUnit = createUnit("black");
      const secondaryUnit = createUnit("white");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(true);
    });

    it("should return false when primary unit facing does not match", () => {
      const primaryUnit = createUnit("black");
      const secondaryUnit = createUnit("white");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        "south"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when primary unit playerSide does not match", () => {
      const primaryUnit = createUnit("black");
      const secondaryUnit = createUnit("white");
      const differentPlayerUnit = createUnit("white");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentPlayerUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when primary unit unitType does not match", () => {
      const primaryUnit = createUnit("black", spearmenUnitType);
      const secondaryUnit = createUnit("white");
      const differentTypeUnit = createUnit("black", swordsmenUnitType);
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentTypeUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when primary unit instanceNumber does not match", () => {
      const primaryUnit = createUnit("black", spearmenUnitType, 1);
      const secondaryUnit = createUnit("white");
      const differentInstanceUnit = createUnit("black", spearmenUnitType, 2);
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentInstanceUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });
  });

  describe("engaged units - secondary unit is friendly", () => {
    it("should return true when secondary unit matches exactly", () => {
      const primaryUnit = createUnit("white");
      const secondaryUnit = createUnit("black");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      // Secondary unit facing is opposite of primary facing
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        "south" // opposite of "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(true);
    });

    it("should return false when secondary unit facing does not match", () => {
      const primaryUnit = createUnit("white");
      const secondaryUnit = createUnit("black");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      // Wrong facing (should be "south" which is opposite of "north")
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        "north"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when secondary unit playerSide does not match", () => {
      const primaryUnit = createUnit("white");
      const secondaryUnit = createUnit("black");
      const differentPlayerUnit = createUnit("white");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentPlayerUnit,
        coordinate,
        "south"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when secondary unit unitType does not match", () => {
      const primaryUnit = createUnit("white");
      const secondaryUnit = createUnit("black", spearmenUnitType);
      const differentTypeUnit = createUnit("black", swordsmenUnitType);
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentTypeUnit,
        coordinate,
        "south"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return false when secondary unit instanceNumber does not match", () => {
      const primaryUnit = createUnit("white");
      const secondaryUnit = createUnit("black", spearmenUnitType, 1);
      const differentInstanceUnit = createUnit("black", spearmenUnitType, 2);
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "north"
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentInstanceUnit,
        coordinate,
        "south"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(false);
    });

    it("should return true when secondary unit matches by value with diagonal facing", () => {
      const primaryUnit = createUnit("white");
      const secondaryUnit = createUnit("black");
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        "northEast"
      );
      // Secondary unit facing is opposite of primary facing ("northEast" -> "southWest")
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        "southWest"
      );

      expect(isAtPlacement(board, unitWithPlacement)).toBe(true);
    });
  });
});
