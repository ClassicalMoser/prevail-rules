import type { ResolveUnitsBrokenEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
} from '@events';
import type { GameState } from '@game';
import {
  getCleanupPhaseState,
  getOtherPlayer,
  getPlayerUnitsOnBoard,
  getSupportedUnitTypes,
} from '@queries';
import type { PlayerSide, UnitType } from '@entities';

/**
 * Generates a ResolveUnitsBrokenEvent for unit types that lost support after a rally.
 *
 * **Legacy / registry path.** Live gameplay expects `assignUnitSupport` instead;
 * this remains so procedure-registry coverage for `resolveUnitsBroken` still works.
 *
 * Compares units on board against supported unit types from cards in hand.
 * Returns the unit TYPES that are no longer supported (all instances will be routed).
 */
export function generateResolveUnitsBrokenEvent(
  state: GameState,
  eventNumber: number,
): ResolveUnitsBrokenEvent {
  const phaseState = getCleanupPhaseState(state);

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
    effectType: RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    player,
    unitTypes: brokenTypes,
  };
}
