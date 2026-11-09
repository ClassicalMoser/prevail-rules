import type { GameState, RetreatState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Retreat substep ready for resolveRetreat in melee: finalPosition set, not yet completed.
 * Resolution order matches attack-apply sequencing: the second player's unit
 * suffers first, since the first player's blow lands first (§7.5.6).
 *
 * @param state - The game state
 * @returns The first retreat in initiative order that has a destination and is not finished
 * @throws Error when neither side has such a retreat
 */
export function getNextMeleeRetreatStateAwaitingMove(
  state: GameState,
): RetreatState {
  const meleeState = getMeleeResolutionState(state);
  // An attack that reached no threshold leaves retreatState 'bypassed', so
  // that side has nothing to retreat. Ready means a destination is chosen and
  // the retreat move is not finished.
  for (const apply of getMeleeAppliesInResolutionOrder(meleeState)) {
    const retreat = apply.retreatState;
    if (
      isOpenSubstep(retreat) &&
      retreat.finalPosition !== 'pending' &&
      !retreat.completed
    ) {
      return retreat;
    }
  }
  throw new Error(
    'No retreat state with finalPosition found in melee resolution',
  );
}
