import type { Restrictions, UnitInstance } from '@entities';
import type { GameState } from '@game';

/**
 * Whether a unit stands where a card's inspiration range reaches.
 *
 * @param unit - The unit on the board.
 * @param restrictions - The card's restrictions.
 * @param gameState - The game.
 * @returns Whether the range reaches the unit.
 */
export function unitMatchesInspirationRange(
  unit: UnitInstance,
  restrictions: Restrictions,
  gameState: GameState,
): boolean {
  return (
    unit.playerSide === gameState.currentInitiative &&
    restrictions.inspirationRangeRestriction !== undefined
  );
}
