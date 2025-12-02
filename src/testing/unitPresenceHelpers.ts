import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { EngagedUnitPresence } from "src/entities/unitPresence/engagedUnitPresence.js";
import type { NoneUnitPresence } from "src/entities/unitPresence/noneUnitPresence.js";
import type { SingleUnitPresence } from "src/entities/unitPresence/singleUnitPresence.js";

/**
 * Creates a none unit presence for testing.
 *
 * @returns A none unit presence
 */
export function createNoneUnitPresence(): NoneUnitPresence {
  return { presenceType: "none" };
}

/**
 * Creates a single unit presence for testing.
 *
 * @param unit - The unit in the space
 * @param facing - The facing direction of the unit
 * @returns A single unit presence
 */
export function createSingleUnitPresence(
  unit: UnitInstance,
  facing: UnitFacing,
): SingleUnitPresence {
  return {
    presenceType: "single",
    unit,
    facing,
  };
}

/**
 * Creates an engaged unit presence for testing.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param primaryFacing - The facing direction of the primary unit
 * @param secondaryUnit - The secondary unit in the engagement (facing opposite the primary unit)
 * @returns An engaged unit presence
 */
export function createEngagedUnitPresence(
  primaryUnit: UnitInstance,
  primaryFacing: UnitFacing,
  secondaryUnit: UnitInstance,
): EngagedUnitPresence {
  return {
    presenceType: "engaged",
    primaryUnit,
    primaryFacing,
    secondaryUnit,
  };
}
