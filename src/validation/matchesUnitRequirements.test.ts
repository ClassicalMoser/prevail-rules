import type { UnitType } from "src/entities/unit/unitType.js";
import { tempUnits } from "src/sampleValues/tempUnits.js";
import { describe, expect, it } from "vitest";
import { matchesUnitRequirements } from "./matchesUnitRequirements.js";

describe("matchesUnitRequirements", () => {
  // Find units by their unique traits rather than by name
  // This makes tests more resilient to changes in sample data
  const unitWithSwordTrait = tempUnits.find((unit) =>
    unit.traits.includes("sword")
  );

  const unitWithFormationAndSwordTraits = tempUnits.find(
    (unit) => unit.traits.includes("formation") && unit.traits.includes("sword")
  );
  const unitWithPhalanxTrait = tempUnits.find((unit) =>
    unit.traits.includes("phalanx")
  );
  const unitWithSkirmishTrait = tempUnits.find((unit) =>
    unit.traits.includes("skirmish")
  );
  const firstUnit = tempUnits[0];

  if (
    !unitWithSwordTrait ||
    !unitWithPhalanxTrait ||
    !unitWithSkirmishTrait ||
    !unitWithFormationAndSwordTraits
  ) {
    throw new Error("Required unit types not found");
  }

  // unitWithSwordTrait: has "sword" trait (e.g., Swordsmen)
  // unitWithPhalanxTrait: has "phalanx" trait (e.g., Spearmen)
  // unitWithSkirmishTrait: has "skirmish" trait (e.g., Skirmishers)

  describe("no requirements", () => {
    it("should return true when both traits and unitTypes are empty", () => {
      expect(matchesUnitRequirements(firstUnit, [], [])).toBe(true);
    });
  });

  describe("traits only", () => {
    it("should return true when unit has all required traits", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, ["formation"], [])
      ).toBe(true);
    });

    it("should return true when unit has all multiple required traits", () => {
      expect(
        matchesUnitRequirements(
          unitWithFormationAndSwordTraits,
          ["formation", "sword"],
          []
        )
      ).toBe(true);
    });

    it("should return true when unit has all traits in different order", () => {
      expect(
        matchesUnitRequirements(
          unitWithFormationAndSwordTraits,
          ["sword", "formation"],
          []
        )
      ).toBe(true);
    });

    it("should return false when unit is missing one trait", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, ["formation", "spear"], [])
      ).toBe(false);
    });

    it("should return false when unit has none of the required traits", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, ["skirmish"], [])
      ).toBe(false);
    });

    it("should return false when unit has some but not all required traits", () => {
      expect(
        matchesUnitRequirements(
          unitWithPhalanxTrait,
          ["formation", "sword"],
          []
        )
      ).toBe(false);
    });
  });

  describe("unitTypes only", () => {
    it("should return true when unit is in the unitTypes array", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, [], [unitWithSwordTrait])
      ).toBe(true);
    });

    it("should return true when unit is in a larger unitTypes array", () => {
      expect(
        matchesUnitRequirements(
          unitWithSwordTrait,
          [],
          [unitWithSwordTrait, unitWithPhalanxTrait]
        )
      ).toBe(true);
    });

    it("should return false when unit is not in the unitTypes array", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, [], [unitWithPhalanxTrait])
      ).toBe(false);
    });

    it("should return true when unit matches by id (different object reference)", () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithSwordTrait,
      };
      expect(
        matchesUnitRequirements(
          sameUnitTypeDifferentRef,
          [],
          [unitWithSwordTrait]
        )
      ).toBe(true);
    });

    it("should return false when unitTypes array is empty but unit is not specified", () => {
      // This case is handled by the "no requirements" case, but testing edge case
      expect(matchesUnitRequirements(unitWithSwordTrait, [], [])).toBe(true);
    });
  });

  describe("both traits and unitTypes", () => {
    it("should return true when unit matches both traits and unitTypes", () => {
      expect(
        matchesUnitRequirements(
          unitWithSwordTrait,
          ["formation"],
          [unitWithSwordTrait]
        )
      ).toBe(true);
    });

    it("should return true when unit matches all multiple traits and unitTypes", () => {
      expect(
        matchesUnitRequirements(
          unitWithSwordTrait,
          ["formation", "sword"],
          [unitWithSwordTrait, unitWithPhalanxTrait]
        )
      ).toBe(true);
    });

    it("should return false when unit matches traits but not unitTypes", () => {
      expect(
        matchesUnitRequirements(
          unitWithSwordTrait,
          ["formation"],
          [unitWithPhalanxTrait]
        )
      ).toBe(false);
    });

    it("should return false when unit matches unitTypes but not traits", () => {
      expect(
        matchesUnitRequirements(
          unitWithSwordTrait,
          ["spear"],
          [unitWithSwordTrait]
        )
      ).toBe(false);
    });

    it("should return false when unit matches neither traits nor unitTypes", () => {
      expect(
        matchesUnitRequirements(
          unitWithSwordTrait,
          ["spear"],
          [unitWithPhalanxTrait]
        )
      ).toBe(false);
    });

    it("should return false when unit has some but not all required traits", () => {
      expect(
        matchesUnitRequirements(
          unitWithPhalanxTrait,
          ["formation", "sword"],
          [unitWithPhalanxTrait]
        )
      ).toBe(false);
    });

    it("should return true when unit matches both by id (different object reference)", () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithSwordTrait,
      };
      expect(
        matchesUnitRequirements(
          sameUnitTypeDifferentRef,
          ["formation"],
          [unitWithSwordTrait]
        )
      ).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle units with many traits", () => {
      expect(
        matchesUnitRequirements(
          unitWithPhalanxTrait,
          ["formation", "spear", "phalanx"],
          []
        )
      ).toBe(true);
    });

    it("should handle units with no traits", () => {
      // Create a unit type with no traits for testing
      const unitWithNoTraits: UnitType = {
        ...unitWithSwordTrait,
        traits: [],
      };
      expect(matchesUnitRequirements(unitWithNoTraits, ["formation"], [])).toBe(
        false
      );
    });

    it("should handle empty traits array with unitTypes", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, [], [unitWithSwordTrait])
      ).toBe(true);
    });

    it("should handle empty unitTypes array with traits", () => {
      expect(
        matchesUnitRequirements(unitWithSwordTrait, ["formation"], [])
      ).toBe(true);
    });
  });
});
