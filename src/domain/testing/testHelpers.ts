import type {
  Card,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import { commandCards } from '@sampleValues';
import { createTestUnit } from './unitHelpers';

/**
 * Checks if a coordinate (and optionally facing) is present in a set of legal moves.
 * This is a test utility for validating move generation functions.
 *
 * @param legalMoves - Set of legal moves to check against
 * @param coordinate - The coordinate to check for
 * @param facing - Optional facing to match (if not provided, matches any facing)
 * @returns True if the coordinate (and facing if specified) is in the legal moves
 */
export function hasMove(
  legalMoves: Set<{ coordinate: string; facing: UnitFacing }>,
  coordinate: StandardBoardCoordinate,
  facing?: UnitFacing,
): boolean {
  return Array.from(legalMoves).some(
    (move) =>
      move.coordinate === coordinate &&
      (facing === undefined || move.facing === facing),
  );
}

/**
 * Gets cards from the commandCards array by their indices.
 * This is a convenience helper for tests that need specific cards.
 *
 * @param indices - The indices of the cards to retrieve (0-based)
 * @returns An array of cards at the specified indices
 * @throws Error if any index is out of bounds
 *
 * @example
 * ```ts
 * // Get the first two cards
 * const cards = getCards(0, 1);
 *
 * // Get specific cards
 * const cards = getCards(0, 2, 3);
 * ```
 */
export function getCards(...indices: number[]): Card[] {
  if (indices.length === 0) {
    return [];
  }

  const cards: Card[] = [];
  for (const index of indices) {
    if (index < 0 || index >= commandCards.length) {
      throw new Error(
        `Card index ${index} is out of bounds. Available cards: 0-${commandCards.length - 1}`,
      );
    }
    cards.push(commandCards[index]);
  }
  return cards;
}

/**
 * Gets a specified number of cards from the commandCards array, starting from the beginning.
 * This is a convenience helper for tests that need a handful of cards.
 *
 * @param count - The number of cards to retrieve (defaults to 1)
 * @returns An array of cards
 * @throws Error if count exceeds available cards
 *
 * @example
 * ```ts
 * // Get 3 cards
 * const cards = getCardsByCount(3);
 *
 * // Get a single card
 * const card = getCardsByCount(1);
 * ```
 */
export function getCardsByCount(count: number = 1): Card[] {
  if (count < 0) {
    throw new Error(`Count must be non-negative, got ${count}`);
  }
  if (count > commandCards.length) {
    throw new Error(
      `Requested ${count} cards but only ${commandCards.length} are available`,
    );
  }
  return commandCards.slice(0, count);
}

/**
 * Creates a UnitWithPlacement for testing with sensible defaults.
 * This is a convenience helper for tests that need a unit at a specific position.
 *
 * @param options - Configuration for the unit and placement
 * @param options.coordinate - The coordinate where the unit is placed (defaults to 'E-5')
 * @param options.facing - The facing of the unit (defaults to 'north')
 * @param options.playerSide - Which player the unit belongs to (defaults to 'black')
 * @param options.unitOptions - Options for the unit
 * @param options.unitOptions.unitType - Specific unit type to use (if not provided, uses flexibility 1)
 * @param options.unitOptions.instanceNumber - Unit instance number (defaults to 1)
 * @param options.unitOptions.flexibility - Flexibility stat value (used if unitType not provided, defaults to 1)
 * @param options.unitOptions.attack - Attack stat value (used if unitType not provided, defaults to 3)
 * @param options.unitOptions.speed - Speed stat value (used if unitType not provided, defaults to 1)
 * @param options.unitOptions.range - Range stat value (used if unitType not provided, defaults to 1)
 * @param options.unitOptions.reverse - Reverse stat value (used if unitType not provided, defaults to 0)
 * @param options.unitOptions.retreat - Retreat stat value (used if unitType not provided, defaults to 0)
 * @param options.unitOptions.rout - Rout stat value (used if unitType not provided, defaults to 0)
 * @param options.unitOptions.cost - Cost stat value (used if unitType not provided, defaults to 0)
 * @param options.unitOptions.limit - Limit stat value (used if unitType not provided, defaults to 0)
 * @param options.unitOptions.routPenalty - Rout penalty stat value (used if unitType not provided, defaults to 0)
 * @returns A UnitWithPlacement object ready for use in tests
 */
export function createUnitWithPlacement(options?: {
  coordinate?: StandardBoardCoordinate;
  facing?: UnitFacing;
  playerSide?: 'black' | 'white';
  unitOptions?: {
    unitType?: UnitType;
    instanceNumber?: number;
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
  };
}): UnitWithPlacement<StandardBoard> {
  const playerSide = options?.playerSide ?? 'black';
  const unit = createTestUnit(playerSide, options?.unitOptions);
  return {
    unit,
    placement: {
      coordinate: options?.coordinate ?? 'E-5',
      facing: options?.facing ?? 'north',
    },
  };
}
