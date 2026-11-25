import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getResolveMeleePhaseState } from '@queries';
import { isResolved } from '@utils';
import { getExpectedMeleeResolutionEvent } from '../iterated';

/**
 * Gets information about the expected event for the Resolve Melee phase.
 *
 * Phase 4 (§4.4): every engaged space fights, one at a time, in the order the
 * first player chooses, each resolved completely before the next.
 *
 * @param state - The current game state with Resolve Melee phase
 * @returns Information about what event is expected
 */
export function getExpectedResolveMeleePhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  // Asked only in Phase 4; any other phase throws in the getter.
  const phaseState = getResolveMeleePhaseState(state);

  // The player who took the initiative in Phase 1 chooses the order (§4.4.2).
  const firstPlayer = state.currentInitiative;

  switch (phaseState.step) {
    case 'resolveMelee': {
      // Check if there's an ongoing melee resolution
      // A melee under way is resolved completely before the next is chosen
      // (§4.4.2), so what it still owes comes first.
      const melee = phaseState.currentMeleeResolutionState;
      if (isResolved(melee)) {
        const meleeUnderWay = getExpectedMeleeResolutionEvent(state, melee);
        return meleeUnderWay;
      }

      // No ongoing resolution - check if there are remaining engagements to resolve
      if (phaseState.remainingEngagements.length > 0) {
        // Initiative player chooses which engagement to resolve
        const chooseNext: ExpectedEventInfo = {
          actionType: 'playerChoice',
          choiceType: 'chooseMeleeResolution',
          playerSource: firstPlayer,
        };
        return chooseNext;
      }

      // Empty queue (including “no melees this round”): complete the phase.
      // With no engagement the phase ends at once (§4.4.4), and cleanup
      // follows.
      const completePhase: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'completeResolveMeleePhase',
      };
      return completePhase;
    }

    case 'complete': {
      // TODO(composition): play never stands on this step.
      // `applyCompleteResolveMeleePhaseEvent` marks the phase complete only
      // in the record of completed phases and moves straight on to cleanup,
      // so the phase is ended from `resolveMelee` above. Answering the same
      // effect here keeps the dispatch total. Settle whether this step should
      // throw instead, as a state play cannot reach.
      const completePhase: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'completeResolveMeleePhase',
      };
      return completePhase;
    }

    default: {
      // A step this phase does not have is a fault in the state.
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid resolveMelee phase step: ${_exhaustive}`);
    }
  }
}
