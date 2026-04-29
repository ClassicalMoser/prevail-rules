import type {
  PlayerSide,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitType,
} from "@entities";
import { createTestUnit } from "@testing/unitHelpers";

/**
 * Short-hand unit placement specification for bootstrapping test scenarios.
 * Supports multiple syntaxes for flexibility:
 *
 * 1. Tuple syntax: ['E-5', 'black'] or ['E-5', 'black', 'north']
 * 2. Object syntax: { coord: 'E-5', player: 'black' }
 * 3. Full control: { coord: 'E-5', player: 'black', facing: 'north', attack: 3 }
 */
export type UnitPlacementSpec =
  | [StandardBoardCoordinate, PlayerSide]
  | [StandardBoardCoordinate, PlayerSide, UnitFacing]
  | {
      coord: StandardBoardCoordinate;
      player: PlayerSide;
      facing?: UnitFacing;
      unitType?: UnitType;
      flexibility?: number;
      attack?: number;
      speed?: number;
      range?: number;
      reverse?: number;
      retreat?: number;
      rout?: number;
      cost?: number;
      limit?: number;
      routPenalty?: number;
      instanceNumber?: number;
    };

/**
 * Extracts the explicitly specified instance number from a spec, if any.
 */
export function getExplicitInstanceNumber(spec: UnitPlacementSpec): number | undefined {
  if (Array.isArray(spec)) {
    return undefined;
  }
  return spec.instanceNumber;
}

/**
 * Normalizes a unit placement spec into a full unit placement object.
 */
export function normalizeUnitPlacement(
  spec: UnitPlacementSpec,
  instanceNumber: number,
): {
  unit: UnitInstance;
  coordinate: StandardBoardCoordinate;
  facing: UnitFacing;
} {
  if (Array.isArray(spec)) {
    const [coord, player, facing = "north"] = spec;
    const unit = createTestUnit(player, { instanceNumber });
    return { unit, coordinate: coord, facing };
  }

  const {
    coord,
    player,
    facing = "north",
    instanceNumber: explicitInstanceNumber = instanceNumber,
    ...unitOptions
  } = spec;

  const unit = createTestUnit(player, {
    instanceNumber: explicitInstanceNumber,
    ...unitOptions,
  });

  return {
    unit,
    coordinate: coord,
    facing,
  };
}

/**
 * Assigns instance numbers to specs.
 * Auto-assigned numbers increment sequentially (1, 2, 3, ...).
 * Explicitly specified numbers are preserved (duplicates allowed).
 */
export function assignInstanceNumbers(
  specs: UnitPlacementSpec[],
): Array<{ spec: UnitPlacementSpec; instanceNumber: number }> {
  let nextAutoNumber = 1;
  const result: Array<{ spec: UnitPlacementSpec; instanceNumber: number }> = [];

  for (const spec of specs) {
    const explicit = getExplicitInstanceNumber(spec);
    if (explicit !== undefined) {
      result.push({ spec, instanceNumber: explicit });
    } else {
      result.push({ spec, instanceNumber: nextAutoNumber });
      nextAutoNumber++;
    }
  }

  return result;
}
