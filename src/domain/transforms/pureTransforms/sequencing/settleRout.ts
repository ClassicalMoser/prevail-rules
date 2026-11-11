import type { PlayerSide } from '@entities';
import type { GameState, RoutState } from '@game';
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
  const retreat = getRetreatState(state, player);
  const closed = updateRetreatState(state, { ...retreat, completed: true });
  return closed;
}

/**
 * A rear engagement is nothing but the defender's rout (§6.3.3): once the
 * rout is paid the engagement is over, and the move can finish.
 */
function closeRearEngagement<S extends GameState>(state: S): S {
  const resolved = updateRearEngagementResolutionState(state, {
    completed: true,
  });
  const closed = completeEngagementInMovement(resolved);
  return closed;
}

/**
 * A rally whose uncovered units have routed and been paid for is over, and
 * cleanup moves on to the next player's rally, or past the rallies.
 */
function closeRally<S extends GameState>(state: S): S {
  const rallyingPlayer = getRallyingPlayer(state);
  const rally = getCurrentRallyResolutionState(state);
  const closed = updateRallyResolutionState(state, rallyingPlayer, {
    ...rally,
    completed: true,
  });
  const advanced = updateCleanupStep(closed, getNextStepForResolveRally(state));
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
  if (location === undefined) {
    throw new Error(`No rout to settle for ${routState.player}`);
  }

  const written = updateRoutState(state, routState);
  if (!routState.completed) {
    return written;
  }

  switch (location.source) {
    case 'retreat': {
      return closeRetreat(written, routState.player);
    }
    case 'rearEngagementMovement': {
      return closeRearEngagement(written);
    }
    case 'rally': {
      return closeRally(written);
    }
    case 'rangedAttack':
    case 'melee': {
      return written;
    }
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = location.source;
      throw new Error(`Unknown rout source: ${String(_exhaustive)}`);
    }
  }
}
