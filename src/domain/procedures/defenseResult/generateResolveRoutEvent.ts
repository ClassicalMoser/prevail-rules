import type { ResolveRoutEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_ROUT_EFFECT_TYPE } from '@events';
import { findRoutAwaitingPenalty } from '@queries';

/**
 * Generates a ResolveRoutEvent by calculating the rout penalty
 * for the unit(s) being routed.
 * The penalty is the sum of all units' morale values.
 *
 * Where the rout sits is the query's answer, not this procedure's: a rout can
 * be held by an attack apply, a rear engagement, a rally, or a retreat that
 * found nowhere to go, and the parent comes back with it so that applying the
 * effect writes the penalty to the slot it came from.
 *
 * @param state - The current game state
 * @param eventNumber - The ordered index of the event in the round
 * @returns A complete ResolveRoutEvent with the routed unit and penalty
 * @throws Error if no rout is awaiting its penalty
 */
export function generateResolveRoutEvent(
  state: GameState,
  eventNumber: number,
): ResolveRoutEvent {
  const location = findRoutAwaitingPenalty(state);
  if (location === undefined) {
    throw new Error('No rout is awaiting its penalty');
  }

  const { routState, source } = location;
  const totalPenalty = routState.unitsToRout.reduce(
    (sum, unit) => sum + unit.unitType.morale,
    0,
  );

  return {
    effectType: RESOLVE_ROUT_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    penalty: totalPenalty,
    routResolutionSource: source,
    unitInstances: routState.unitsToRout,
  };
}
