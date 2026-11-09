import type { GameState, RoutState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Rout state from melee resolution, in resolution order (the second player's unit first, §7.5.6).
 * Assumes resolveMelee phase and that one attack-apply carries a rout still owed.
 *
 * @param state - The game state
 * @returns The first rout still owed, in resolution order
 * @throws Error when neither apply has an open rout
 */
export function getNextMeleeRoutState(state: GameState): RoutState {
  const meleeState = getMeleeResolutionState(state);
  // An attack that reached no threshold leaves routState 'bypassed', so that
  // side has nothing to rout.
  for (const apply of getMeleeAppliesInResolutionOrder(meleeState)) {
    // A rout already paid is settled and is passed over.
    if (isOpenSubstep(apply.routState) && !apply.routState.completed) {
      return apply.routState;
    }
  }
  throw new Error('No rout state found in melee resolution');
}
