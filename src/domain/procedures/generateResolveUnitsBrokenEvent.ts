import type { Board, GameState, PlayerSide, UnitType } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
} from '@events';
import {
  getOtherPlayer,
  getPlayerUnitsOnBoard,
  getSupportedUnitTypes,
} from '@queries';

/**
 * Generates a ResolveUnitsBrokenEvent for unit types that lost support after a rally.
 * Compares units on board against supported unit types from cards in hand.
 * Returns the unit TYPES that are no longer supported (all instances will be routed).
 *
 * @param state - The current game state
 * @returns A complete ResolveUnitsBrokenEvent with unit types that lost support
 *
 * @example
 * ```typescript
 * // After rally, cards returned to hand
 * const event = generateResolveUnitsBrokenEvent(state);
 *
 * // Event contains unit types that no longer have card support
 * // Handler will rout ALL instances of these types
 * const newState = applyEvent(event, state);
 * ```
 */
export function generateResolveUnitsBrokenEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveUnitsBrokenEvent<TBoard, 'resolveUnitsBroken'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'cleanup') {
    throw new Error('Current phase is not cleanup');
  }

  // Determine which player just rallied based on the step
  const firstPlayer = state.currentInitiative;
  let player: PlayerSide;

  if (phaseState.step === 'firstPlayerResolveRally') {
    player = firstPlayer;
  } else if (phaseState.step === 'secondPlayerResolveRally') {
    player = getOtherPlayer(firstPlayer);
  } else {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
    );
  }
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
