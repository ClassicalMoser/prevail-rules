import type { Card, PlayerSide } from '@entities';

/**
 * Calculates which player receives initiative based on card values.
 *
 * Rules:
 * - Player with lower initiative value receives initiative
 * - In case of tie, player who currently has initiative keeps it
 *
 * @param whiteCard - The card played by the white player
 * @param blackCard - The card played by the black player
 * @param currentInitiative - The player who currently has initiative (for tiebreaker)
 * @returns The player who receives initiative for this round
 *
 * @example
 * ```typescript
 * const white = { initiative: 2, ... };
 * const black = { initiative: 3, ... };
 * const winner = calculateInitiative(white, black, 'white');
 * // Returns 'white' (lower initiative value wins)
 * ```
 *
 * @example
 * ```typescript
 * const white = { initiative: 2, ... };
 * const black = { initiative: 2, ... };
 * const winner = calculateInitiative(white, black, 'black');
 * // Returns 'black' (tie goes to current holder)
 * ```
 */
export function calculateInitiative(
  whiteCard: Card,
  blackCard: Card,
  currentInitiative: PlayerSide,
): PlayerSide {
  const whiteInitiative = whiteCard.initiative;
  const blackInitiative = blackCard.initiative;

  // Lower initiative value wins
  if (whiteInitiative < blackInitiative) {
    return 'white';
  }

  if (blackInitiative < whiteInitiative) {
    return 'black';
  }

  // Tie: current holder keeps it
  return currentInitiative;
}
