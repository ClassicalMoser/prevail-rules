import type { Board, GameState, PlayerSide, UnitType } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
} from '@events';
import { getPlayerUnitsOnBoard, getSupportedUnitTypes } from '@queries';

/**
 * Generates a ResolveUnitsBrokenEvent for unit types that lost support after a rally.
 * Compares units on board against supported unit types from cards in hand.
 * Returns the unit TYPES that are no longer supported (all instances will be routed).
 *
 * @param state - The current game state
 * @param player - The player whose units to check
 * @returns A complete ResolveUnitsBrokenEvent with unit types that lost support
 *
 * @example
 * ```typescript
 * // After rally, cards returned to hand
 * const event = generateResolveUnitsBrokenEvent(state, 'white');
 *
 * // Event contains unit types that no longer have card support
 * // Handler will rout ALL instances of these types
 * const newState = applyEvent(event, state);
 * ```
 */
export function generateResolveUnitsBrokenEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
): ResolveUnitsBrokenEvent<TBoard> {
  const supportedTypeIds = getSupportedUnitTypes(state, player);
  const unitsOnBoard = getPlayerUnitsOnBoard(state, player);
  const brokenTypes: UnitType[] = [];
  const seenTypes = new Set<string>();

  // Find unique unit types that are no longer supported
  for (const unit of unitsOnBoard) {
    const typeId = unit.unitType.id;
    if (!supportedTypeIds.has(typeId) && !seenTypes.has(typeId)) {
      brokenTypes.push(unit.unitType);
      seenTypes.add(typeId);
    }
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
    player,
    unitTypes: brokenTypes,
  };
}
