import type { PlayerSide } from '@entities';
import type { GameState, RoutState } from '@game';
import type { RoutLocation } from '@queries';
import {
  findRoutLocation,
  getCurrentRallyResolutionState,
  getNextStepForResolveRally,
  getRallyingPlayer,
  getRetreatState,
} from '@queries';
import { completeEngagementInMovement } from './completeEngagementInMovement';
import { updateCleanupStep } from './updateCleanupStep';
import { updateRallyResolutionState } from './updateRallyResolutionState';
import { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';
import { updateRetreatState } from './updateRetreatState';
import { updateRoutState } from './updateRoutState';

/**
 * A retreat that fell into a rout has nothing left to do once the rout is
 * paid: the unit has left the battle (§9.1.6).
 */
function closeRetreat<S extends GameState>(state: S, player: PlayerSide): S {
  // The retreat the routing unit could not make, holding the rout just paid.
  const retreat = getRetreatState(state, player);

  // The rout took the retreat's place (§7.5.6), so the retreat is done. The
  // attack's apply around it stays open for `completeAttackApply`.
  const closed = updateRetreatState(state, { ...retreat, completed: true });
  return closed;
}

/**
 * A rear engagement is nothing but the defender's rout (§6.3.3): once the
 * rout is paid the engagement is over, and the move can finish.
 */
function closeRearEngagement<S extends GameState>(state: S): S {
  // The rout was all the rear engagement asked for, so its resolution is done.
  const resolved = updateRearEngagementResolutionState(state, {
    completed: true,
  });

  // And so is the engagement itself; the engaging unit stays where it stands
  // (§6.3.3), and its move can be finished.
  const closed = completeEngagementInMovement(resolved);
  return closed;
}

/**
 * A rally whose uncovered units have routed and been paid for is over, and
 * cleanup moves on to the next player's rally, or past the rallies.
 */
function closeRally<S extends GameState>(state: S): S {
  // The rally the cleanup step is on, whose support check routed these units.
  const rallyingPlayer = getRallyingPlayer(state);
  const rally = getCurrentRallyResolutionState(state);

  // Paying for the units it could not hold is the last part of a rally
  // (§10.4.7), so the rally is over.
  const closed = updateRallyResolutionState(state, rallyingPlayer, {
    ...rally,
    completed: true,
  });

  // The first player finishes their rally before the second chooses whether
  // to rally (§10.3.6); after the second, cleanup is done.
  const nextStep = getNextStepForResolveRally(state);
  const advanced = updateCleanupStep(closed, nextStep);
  return advanced;
}

/**
 * Records a rout and, once it is settled, closes what it was holding open.
 *
 * A rout is settled two ways: by the Morale being paid in cards, or by there
 * being none to pay (§9.3.2). Either way the same parents are waiting on it,
 * and each is closed here, once:
 * - a retreat that fell into the rout ends, since the unit is gone;
 * - a rear engagement, which is only the rout, ends and the move can finish;
 * - a rally ends, and cleanup moves on.
 *
 * A rout from a ranged attack or a melee closes nothing here. The attack's
 * result stays open until `completeAttackApply`, because in a melee both
 * sides must finish before the fight moves on (§7.5.6).
 *
 * A rout still owed closes nothing; it is written and its parent waits.
 *
 * @param state - The current game state
 * @param routState - The rout as it now stands
 * @returns The state with the rout written and, if it is settled, its parent closed
 * @throws Error when the player named on the rout is not routing
 */
export function settleRout<S extends GameState>(
  state: S,
  routState: RoutState,
): S {
  // Where the rout sits decides what it was holding open.
  const location = findRoutLocation(state, routState.player);
  // A rout belongs to the player who pays for it; one named for a player who
  // is not routing is a fault in the event that carried it.
  if (location === undefined) {
    throw new Error(`No rout to settle for ${routState.player}`);
  }

  // The rout is written where it sits, settled or not.
  const written = updateRoutState(state, routState);

  // A rout still owing its cards holds its parent open until they are paid.
  if (!routState.completed) {
    return written;
  }

  // What closes once the rout is paid, keyed by where it sits. The source is
  // `findRoutLocation`'s own answer, not an argument, so the type demands a
  // closer for every source and a source left out fails to compile.
  const closeBySource: Record<RoutLocation['source'], () => S> = {
    // The unit that could not retreat has left the battle.
    retreat: () => closeRetreat(written, routState.player),
    // Caught from behind, the defender routed and nothing else happens.
    rearEngagementMovement: () => closeRearEngagement(written),
    // The support check's routs are paid together, once (§10.4.7).
    rally: () => closeRally(written),
    // The attack's apply closes in `completeAttackApply`, after every result
    // due on it is carried out.
    rangedAttack: () => written,
    melee: () => written,
  };
  const settled = closeBySource[location.source]();
  return settled;
}
