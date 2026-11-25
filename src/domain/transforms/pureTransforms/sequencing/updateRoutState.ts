import type { GameState, RoutState } from '@game';
import {
  findRoutLocation,
  getCurrentPhaseState,
  getAttackApplyStateOfPlayer,
  getCurrentRallyResolutionState,
  getRallyingPlayer,
} from '@queries';
import { updateAttackApplyState } from './updateAttackApplyState';
import { updateRallyResolutionState } from './updateRallyResolutionState';
import { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';
import { updateRetreatRoutState } from './updateRetreatRoutState';

/**
 * Creates a new game state with the rout state updated. It writes the rout
 * where it sits and nothing else; closing what a settled rout held open is
 * `settleRout`'s.
 *
 * Where the rout sits is {@link findRoutLocation}'s answer, the same one settleRout
 * reads, so the two cannot disagree. A rout can sit on:
 * - the result of a ranged attack, or of either side of a melee
 * - a rear engagement during a movement (§6.3.3)
 * - a rally during cleanup
 * - a retreat with nowhere to go (§9.1.6), which holds its own rout inside the
 *   retreat, wherever that retreat sits
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 * @throws Error when the player named on the rout is not routing
 */
export function updateRoutState<S extends GameState>(
  state: S,
  routState: RoutState,
): S {
  // The rout is written back to the parent that already holds it open.
  const location = findRoutLocation(state, routState.player);
  // A rout belongs to the player who pays for it, and this writer only
  // carries an opened one forward: opening it is the parent's own writer's.
  if (location === undefined) {
    // Say where it was asked, since that is usually what went wrong.
    const { phase } = getCurrentPhaseState(state);
    throw new Error(
      `No open rout to write for ${routState.player} in phase ${phase}`,
    );
  }

  switch (location.source) {
    case 'retreat': {
      // Written through the retreat, whichever attack the retreat belongs to.
      const written = updateRetreatRoutState(state, routState);
      // The retreat, holding the rout of a unit with nowhere to go (§9.1.6).
      return written;
    }
    case 'rearEngagementMovement': {
      // A defender caught from behind routs on the spot (§6.3.3).
      const written = updateRearEngagementResolutionState(state, {
        routState,
      });
      // The rear engagement, holding the defender's rout.
      return written;
    }
    case 'rangedAttack':
    case 'melee': {
      // The apply of the attack that routed this player's unit.
      const apply = getAttackApplyStateOfPlayer(state, routState.player);
      const written = updateAttackApplyState(state, { ...apply, routState });
      // The attack's results, holding the rout of the unit it broke.
      return written;
    }
    case 'rally': {
      // The rally on this cleanup step, whose support check left these
      // units without a place (§10.4.6).
      const rallyingPlayer = getRallyingPlayer(state);
      const rallyState = getCurrentRallyResolutionState(state);
      const written = updateRallyResolutionState(state, rallyingPlayer, {
        ...rallyState,
        routState,
      });
      // The rally, holding the rout of every unit it could not hold.
      return written;
    }
    default: {
      // TODO(composition): unreachable, so no spec has a case for it, as in
      // `settleRout`: `findRoutLocation` answers only the five sources above.
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = location.source;
      throw new Error(`Unknown rout source: ${String(_exhaustive)}`);
    }
  }
}
