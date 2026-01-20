import type { Board, GameState, PlayerSide, UnitInstance } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_UNITS_BROKEN_EFFECT_TYPE } from '@events';
import { getPlayerUnitsOnBoard, getSupportedUnitTypes } from '@queries';

/**
 * Generates a ResolveUnitsBrokenEvent for units that lost support after a rally.
 * Compares units on board against supported unit types from cards in hand.
 * Units whose type is not supported are routed.
 *
 * @param state - The current game state
 * @param player - The player whose units to check
 * @returns A complete ResolveUnitsBrokenEvent with units that lost support
 *
 * @example
 * ```typescript
 * // After rally, cards returned to hand
 * const event = generateResolveUnitsBrokenEvent(state, 'white');
 * 
 * // Event contains all units that no longer have card support
 * // Apply to engine to rout those units
 * const newState = applyEvent(event, state);
 * ```
 */
export function generateResolveUnitsBrokenEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
): ResolveUnitsBrokenEvent {
  const supportedTypes = getSupportedUnitTypes(state, player);
  const unitsOnBoard = getPlayerUnitsOnBoard(state, player);
  const brokenUnits = new Set<UnitInstance>();

  // Check each unit to see if its type is supported
  for (const unit of unitsOnBoard) {
    if (!supportedTypes.has(unit.unitType.id)) {
      brokenUnits.add(unit);
    }
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
    player,
    brokenUnits,
  };
}
