import type { Card, StandardBoardCoordinate, UnitFacing } from '@entities';
import { commandCards } from '@sampleValues';

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
