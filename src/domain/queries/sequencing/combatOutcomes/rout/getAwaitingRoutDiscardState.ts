import type { GameState, RoutState } from '@game';
import { getCurrentCommandResolutionState } from '@queries/sequencing/commandResolution/getCurrentCommandResolutionState';
import { getCurrentPhaseState } from '@queries/sequencing/phases/getCurrentPhaseState';
import { getRallyStepRoutState } from './getRallyStepRoutState';
import { getRangedAttackApplyState } from '../attackApply/getRangedAttackApplyState';
import { getRearEngagementRoutState } from './getRearEngagementRoutState';
import { getRoutStateFromAttackApply } from './getRoutStateFromAttackApply';
import { getNextMeleeRoutState } from './getNextMeleeRoutState';
import { throwIfBypassed } from '@utils';

/**
 * Active {@link RoutState} awaiting `chooseRoutDiscard` (penalty known, cards
 * not chosen yet). Searches issueCommands (rear / ranged), resolveMelee, and
 * cleanup rally. `null` when discard is not expected.
 *
 * Play-cards, move-commanders, and a command that is neither movement nor a
 * ranged attack return null. A slot reader throws when the slice it names is absent.
 */
export function getAwaitingRoutDiscardState(
  state: GameState,
): RoutState | null {
  const phaseState = getCurrentPhaseState(state);
  let routState: RoutState;

  if (phaseState.phase === 'issueCommands') {
    const crs = getCurrentCommandResolutionState(state);
    // Movement routs from the rear. A ranged rout sits on the attack apply.
    if (crs.commandResolutionType === 'movement') {
      routState = getRearEngagementRoutState(state);
    } else if (crs.commandResolutionType === 'rangedAttack') {
      routState = throwIfBypassed(
        getRoutStateFromAttackApply(getRangedAttackApplyState(state)),
        'The ranged attack applied no rout',
      );
    } else {
      return null;
    }
  } else if (phaseState.phase === 'resolveMelee') {
    routState = getNextMeleeRoutState(state);
  } else if (phaseState.phase === 'cleanup') {
    routState = getRallyStepRoutState(state);
  } else {
    return null;
  }

  // The discard is still ahead only when the penalty is known,
  // cards have not been chosen, and the rout is not finished.
  if (
    routState.cardsChosen ||
    routState.completed ||
    routState.numberToDiscard === 'pending'
  ) {
    return null;
  }

  return routState;
}
