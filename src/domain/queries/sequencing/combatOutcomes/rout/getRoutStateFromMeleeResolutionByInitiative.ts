import type { GameState, RoutState } from '@game';
import { getOtherPlayer } from '@queries/player';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Rout state from melee resolution, in initiative order (first player's apply first).
 * Assumes resolveMelee phase and that one attack-apply carries an active rout.
 *
 * @param state - The game state
 * @returns The first open rout in initiative order
 * @throws Error when neither apply has an open rout
 */
export function getRoutStateFromMeleeResolutionByInitiative(
  state: GameState,
): RoutState {
  const meleeState = getMeleeResolutionState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  const firstApply = meleeState[`${firstPlayer}AttackApplyState`];
  const secondApply = meleeState[`${secondPlayer}AttackApplyState`];

  // A miss apply has routState 'miss'. That side has nothing to rout.
  // A pending apply is skipped. The second player is checked only then.
  if (firstApply !== 'pending' && isOpenSubstep(firstApply.routState)) {
    return firstApply.routState;
  }
  if (secondApply !== 'pending' && isOpenSubstep(secondApply.routState)) {
    return secondApply.routState;
  }
  throw new Error('No rout state found in melee resolution');
}
