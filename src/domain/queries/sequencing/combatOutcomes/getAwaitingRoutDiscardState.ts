import type { GameState, RoutState } from '@game';
import { getCurrentCommandResolutionState } from '../getCommandResolutionState';
import { getCurrentPhaseState } from '../getPhaseState';

import { getAttackApplyStateFromRangedAttack } from './attackApply';
import { getRoutStateFromRearEngagement } from './getRoutStateFromRearEngagement';
import { getRoutStateFromCleanupPhaseForResolveRout } from './rally';
import {
  getRoutStateFromAttackApply,
  getRoutStateFromMeleeResolutionByInitiative,
} from './rout';

/**
 * Active {@link RoutState} awaiting `chooseRoutDiscard` (penalty known, cards
 * not chosen yet). Searches issueCommands (rear / ranged), resolveMelee, and
 * cleanup rally. `null` when discard is not expected.
 */
export function getAwaitingRoutDiscardState(
  state: GameState,
): RoutState | null {
  try {
    const phaseState = getCurrentPhaseState(state);
    let routState: RoutState;

    if (phaseState.phase === 'issueCommands') {
      const crs = getCurrentCommandResolutionState(state);
      if (crs.commandResolutionType === 'movement') {
        routState = getRoutStateFromRearEngagement(state);
      } else if (crs.commandResolutionType === 'rangedAttack') {
        routState = getRoutStateFromAttackApply(
          getAttackApplyStateFromRangedAttack(state),
        );
      } else {
        return null;
      }
    } else if (phaseState.phase === 'resolveMelee') {
      routState = getRoutStateFromMeleeResolutionByInitiative(state);
    } else if (phaseState.phase === 'cleanup') {
      routState = getRoutStateFromCleanupPhaseForResolveRout(state);
    } else {
      return null;
    }

    if (
      routState.cardsChosen ||
      routState.completed ||
      routState.numberToDiscard === 'pending'
    ) {
      return null;
    }

    return routState;
  } catch {
    return null;
  }
}
