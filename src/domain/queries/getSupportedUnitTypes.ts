import type { GameState, PlayerSide } from '@entities';

/**
 * Gets the set of unit type IDs that are currently supported by the player's cards in hand.
 * A unit type is supported if at least one card in the player's hand preserves it.
 *
 * @param state - The current game state
 * @param player - The player whose supported unit types to get
 * @returns Set of unit type IDs that are supported
 *
 * @example
 * ```typescript
 * const supportedTypes = getSupportedUnitTypes(state, 'white');
 * // Returns Set(['unit-type-1', 'unit-type-2', ...])
 * ```
 */
export function getSupportedUnitTypes(
  state: GameState,
  player: PlayerSide,
): Set<string> {
  const supportedTypes = new Set<string>();
  const playerHand = state.cardState[player].inHand;

  for (const card of playerHand) {
    for (const unitTypeId of card.unitPreservation) {
      supportedTypes.add(unitTypeId);
    }
  }

  return supportedTypes;
}
