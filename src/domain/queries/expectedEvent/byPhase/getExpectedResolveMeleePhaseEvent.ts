import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getResolveMeleePhaseState } from '@queries/sequencing';
import { getExpectedMeleeResolutionEvent } from '../iterated';

/**
 * Gets information about the expected event for the Resolve Melee phase.
 *
 * @param state - The current game state with Resolve Melee phase
 * @returns Information about what event is expected
 */
export function getExpectedResolveMeleePhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = getResolveMeleePhaseState(state);
  const firstPlayer = state.currentInitiative;

  switch (phaseState.step) {
    case 'resolveMelee': {
      // Check if there's an ongoing melee resolution
      if (phaseState.currentMeleeResolutionState) {
        return getExpectedMeleeResolutionEvent(
          state,
          phaseState.currentMeleeResolutionState,
        );
      }

      // No ongoing resolution - check if there are remaining engagements to resolve
      if (phaseState.remainingEngagements.size > 0) {
        // Initiative player chooses which engagement to resolve
        return {
          actionType: 'playerChoice',
          playerSource: firstPlayer,
          choiceType: 'chooseMeleeResolution',
        };
      }

      // All engagements resolved - should have advanced to complete step
      throw new Error(
        'All engagements resolved but step not advanced to complete',
      );
    }

    case 'complete':
      return {
        actionType: 'gameEffect',
        effectType: 'completeResolveMeleePhase',
      };

    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid resolveMelee phase step: ${_exhaustive}`);
    }
  }
}
