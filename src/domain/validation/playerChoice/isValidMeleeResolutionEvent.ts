import type { Board, ValidationResult } from '@entities';
import type { ChooseMeleeResolutionEventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { RESOLVE_MELEE_PHASE } from '@game';

/**
 * Validates whether a choose melee resolution event is legal for the current state.
 *
 * @param event - The choose melee resolution event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseMeleeResolutionEvent<TBoard extends Board>(
  event: ChooseMeleeResolutionEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): ValidationResult {
  try {
    const { player, space } = event;
    const { currentPhaseState } = state.currentRoundState;

    if (!currentPhaseState) {
      return {
        errorReason: 'No current phase state found',
        result: false,
      };
    }

    if (currentPhaseState.phase !== RESOLVE_MELEE_PHASE) {
      return {
        errorReason: `Current phase is ${currentPhaseState.phase}, not resolveMelee`,
        result: false,
      };
    }

    if (currentPhaseState.step !== 'resolveMelee') {
      return {
        errorReason: `Resolve melee phase is on ${currentPhaseState.step} step, not resolveMelee`,
        result: false,
      };
    }

    if (currentPhaseState.currentMeleeResolutionState !== undefined) {
      return {
        errorReason:
          'Melee resolution is already in progress; cannot choose a new engagement',
        result: false,
      };
    }

    if (currentPhaseState.remainingEngagements.size === 0) {
      return {
        errorReason: 'No remaining engagements to resolve',
        result: false,
      };
    }

    if (!currentPhaseState.remainingEngagements.has(space as never)) {
      return {
        errorReason: `Space ${space} is not among remaining engagements`,
        result: false,
      };
    }

    if (player !== state.currentInitiative) {
      return {
        errorReason: `Expected initiative player ${state.currentInitiative} to choose melee resolution, not ${player}`,
        result: false,
      };
    }

    return {
      result: true,
    };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
