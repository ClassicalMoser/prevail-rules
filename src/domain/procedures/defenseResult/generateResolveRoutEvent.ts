import type { ResolveRoutEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_ROUT_EFFECT_TYPE } from '@events';
import { findRoutAwaitingPenalty } from '@queries';
import { throwIfUndefined } from '@utils';

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
  // The rout whose Morale cost is still to be counted: a unit routed by an
  // attack, engaged from the rear (§6.3.3), left over at the support check
  // after a rally (§10.4.6), or with nowhere to retreat (§9.1.6). None means
  // the effect is not owed.
  const awaitingPenalty = findRoutAwaitingPenalty(state);
  const location = throwIfUndefined(
    awaitingPenalty,
    'No rout is awaiting its penalty',
  );
  const { routState } = location;

  // Its owner discards one card for each point of Morale (§9.3.2). Units that
  // rout at the same moment, as at the support check, are paid for together:
  // their Morale is summed into one discard (§9.3.3). Morale 0 costs nothing.
  const totalPenalty = routState.unitsToRout.reduce(
    (sum, unit) => sum + unit.unitType.morale,
    0,
  );

  const event: ResolveRoutEvent = {
    effectType: RESOLVE_ROUT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    penalty: totalPenalty,
    player: routState.player,
  };

  // The player who pays, and how many cards. The apply finds the rout by
  // that player and writes the count on it as the number to discard, which
  // the endgame check reads to see whether the owner can pay (§11.2).
  return event;
}
