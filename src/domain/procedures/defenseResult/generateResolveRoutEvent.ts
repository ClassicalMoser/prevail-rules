import type { ResolveRoutEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_ROUT_EFFECT_TYPE } from '@events';
import { findRoutAwaitingPenalty } from '@queries';

/**
 * Generates a ResolveRoutEvent by calculating the rout penalty
 * for the unit(s) being routed.
 * The penalty is the sum of all units' morale values.
 *
 * Which rout is awaiting its penalty is the query's answer, not this
 * procedure's.
 *
 * @param state - The current game state
 * @returns A complete ResolveRoutEvent with the routed unit and penalty
 * @throws Error if no rout is awaiting its penalty
 */
export function generateResolveRoutEvent(state: GameState): ResolveRoutEvent {
  const location = findRoutAwaitingPenalty(state);
  if (location === undefined) {
    throw new Error('No rout is awaiting its penalty');
  }

  const { routState } = location;
  const totalPenalty = routState.unitsToRout.reduce(
    (sum, unit) => sum + unit.unitType.morale,
    0,
  );

  return {
    effectType: RESOLVE_ROUT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    penalty: totalPenalty,
    player: routState.player,
  };
}
