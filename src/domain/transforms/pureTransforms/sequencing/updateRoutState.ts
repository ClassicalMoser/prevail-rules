import type { GameState, RoutState } from '@game';
import type { RoutLocation } from '@queries';
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
 * The rout written into the apply of the attack that routed the player's unit,
 * which holds the rout of the unit it broke.
 */
function writeToAttackApply<S extends GameState>(
  state: S,
  routState: RoutState,
): S {
  const apply = getAttackApplyStateOfPlayer(state, routState.player);
  const applied = updateAttackApplyState(state, { ...apply, routState });
  return applied;
}

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

  // Where to write it, keyed by where it sits. The source is
  // `findRoutLocation`'s own answer, not an argument, so the type demands a
  // writer for every source and a source left out fails to compile.
  const writeBySource: Record<RoutLocation['source'], () => S> = {
    // Written through the retreat, whichever attack the retreat belongs to:
    // the retreat holds the rout of a unit with nowhere to go (§9.1.6).
    retreat: () => updateRetreatRoutState(state, routState),
    // A defender caught from behind routs on the spot (§6.3.3); the rear
    // engagement holds its rout.
    rearEngagementMovement: () =>
      updateRearEngagementResolutionState(state, { routState }),
    // The apply of the attack that routed this player's unit holds the rout
    // of the unit it broke.
    rangedAttack: () => writeToAttackApply(state, routState),
    melee: () => writeToAttackApply(state, routState),
    // The rally on this cleanup step, whose support check left these units
    // without a place (§10.4.6), holds the rout of every unit it could not
    // hold.
    rally: () => {
      const rallyingPlayer = getRallyingPlayer(state);
      const rallyState = getCurrentRallyResolutionState(state);
      const written = updateRallyResolutionState(state, rallyingPlayer, {
        ...rallyState,
        routState,
      });
      return written;
    },
  };
  const written = writeBySource[location.source]();
  return written;
}
