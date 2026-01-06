import type {
  GameState,
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitType,
} from '@entities';
import { createBoardWithUnits } from './createBoard';
import { createEmptyGameState } from './createEmptyGameState';
import { createTestUnit } from './unitHelpers';

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
function getExplicitInstanceNumber(
  spec: UnitPlacementSpec,
): number | undefined {
  if (Array.isArray(spec)) {
    return undefined;
  }
  return spec.instanceNumber;
}

/**
 * Normalizes a unit placement spec into a full unit placement object.
 */
function normalizeUnitPlacement(
  spec: UnitPlacementSpec,
  instanceNumber: number,
): {
  unit: UnitInstance;
  coordinate: StandardBoardCoordinate;
  facing: UnitFacing;
} {
  // Handle tuple syntax
  if (Array.isArray(spec)) {
    const [coord, player, facing = 'north'] = spec;
    const unit = createTestUnit(player, {
      instanceNumber,
    });
    return {
      unit,
      coordinate: coord,
      facing,
    };
  }

  // Handle object syntax
  const {
    coord,
    player,
    facing = 'north',
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
 * Auto-assigned numbers increment sequentially (1, 2, 3, ...) and never repeat.
 * Explicitly specified numbers are preserved (duplicates allowed).
 */
function assignInstanceNumbers(
  specs: UnitPlacementSpec[],
): Array<{ spec: UnitPlacementSpec; instanceNumber: number }> {
  let nextAutoNumber = 1;
  const result: Array<{ spec: UnitPlacementSpec; instanceNumber: number }> = [];

  for (const spec of specs) {
    const explicit = getExplicitInstanceNumber(spec);
    if (explicit !== undefined) {
      // Use explicitly specified number (duplicates allowed)
      result.push({ spec, instanceNumber: explicit });
    } else {
      // Auto-assign next sequential number
      result.push({ spec, instanceNumber: nextAutoNumber });
      nextAutoNumber++;
    }
  }

  return result;
}

/**
 * Creates a game state with units placed according to the provided specifications.
 * This is a convenience function for quickly bootstrapping test scenarios.
 *
 * @param units - Array of unit placement specifications (supports multiple syntaxes)
 * @param options - Optional configuration for the game state
 * @param options.currentInitiative - Which player has initiative (defaults to 'black')
 * @returns A game state with the specified units placed
 *
 * @example
 * ```ts
 * // Tuple syntax - minimal
 * const gameState = createGameState([
 *   ['E-5', 'black'],
 *   ['E-6', 'white'],
 * ]);
 *
 * // Tuple syntax with facing
 * const gameState = createGameState([
 *   ['E-5', 'black', 'north'],
 *   ['E-6', 'white', 'south'],
 * ]);
 *
 * // Object syntax with defaults
 * const gameState = createGameState([
 *   { coord: 'E-5', player: 'black' },
 *   { coord: 'E-6', player: 'white', facing: 'east' },
 * ]);
 *
 * // Full control
 * const gameState = createGameState([
 *   { coord: 'E-5', player: 'black', attack: 3, flexibility: 2 },
 *   { coord: 'E-6', player: 'white', unitType: someUnitType },
 * ]);
 * ```
 */
export function createGameState(
  units: UnitPlacementSpec[],
  options?: {
    currentInitiative?: PlayerSide;
  },
): GameState<StandardBoard> {
  const gameState = createEmptyGameState(options);
  const assignments = assignInstanceNumbers(units);
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );
  const board = createBoardWithUnits(normalizedUnits);
  return {
    ...gameState,
    boardState: board,
  };
}

/**
 * Creates a board with units placed according to the provided specifications.
 * This is a convenience function for quickly bootstrapping test scenarios.
 *
 * @param units - Array of unit placement specifications (supports multiple syntaxes)
 * @returns A board with the specified units placed
 *
 * @example
 * ```ts
 * // Tuple syntax - minimal
 * const board = createBoard([
 *   ['E-5', 'black'],
 *   ['E-6', 'white'],
 * ]);
 *
 * // Object syntax with full control
 * const board = createBoard([
 *   { coord: 'E-5', player: 'black', attack: 3 },
 *   { coord: 'E-6', player: 'white', flexibility: 2 },
 * ]);
 * ```
 */
export function createBoard(units: UnitPlacementSpec[]): StandardBoard {
  const assignments = assignInstanceNumbers(units);
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );
  return createBoardWithUnits(normalizedUnits);
}
