import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

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
  if (state.cardState.visibility !== 'authoritative') {
    throw new Error(
      'getSupportedUnitTypes requires an authoritative card state',
    );
  }

  const supportedTypes = new Set<string>();
  const playerHand = state.cardState[player].inHand;

  for (const card of playerHand) {
    if (card.unitSupport.supportType === 'unitType') {
      supportedTypes.add(card.unitSupport.unitTypeId);
    }
    if (card.unitSupport.supportType === 'trait') {
      supportedTypes.add(card.unitSupport.trait);
    }
  }

  return supportedTypes;
}
