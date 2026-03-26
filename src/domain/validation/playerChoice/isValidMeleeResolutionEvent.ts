import type { Board, GameState, ValidationResult } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { RESOLVE_MELEE_PHASE } from '@entities';

/**
 * Validates whether a choose melee resolution event is legal for the current state.
 *
 * @param event - The choose melee resolution event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseMeleeResolutionEvent<TBoard extends Board>(
  event: ChooseMeleeResolutionEvent<TBoard>,
  state: GameState<TBoard>,
): ValidationResult {
  try {
    const { player, space } = event;
    const currentPhaseState = state.currentRoundState.currentPhaseState;

    if (!currentPhaseState) {
      return {
        result: false,
        errorReason: 'No current phase state found',
      };
    }

    if (currentPhaseState.phase !== RESOLVE_MELEE_PHASE) {
      return {
        result: false,
        errorReason: `Current phase is ${currentPhaseState.phase}, not resolveMelee`,
      };
    }

    if (currentPhaseState.step !== 'resolveMelee') {
      return {
        result: false,
        errorReason: `Resolve melee phase is on ${currentPhaseState.step} step, not resolveMelee`,
      };
    }

    if (currentPhaseState.currentMeleeResolutionState !== undefined) {
      return {
        result: false,
        errorReason:
          'Melee resolution is already in progress; cannot choose a new engagement',
      };
    }

    if (currentPhaseState.remainingEngagements.size === 0) {
      return {
        result: false,
        errorReason: 'No remaining engagements to resolve',
      };
    }

    if (!currentPhaseState.remainingEngagements.has(space)) {
      return {
        result: false,
        errorReason: `Space ${space} is not among remaining engagements`,
      };
    }

    if (player !== state.currentInitiative) {
      return {
        result: false,
        errorReason: `Expected initiative player ${state.currentInitiative} to choose melee resolution, not ${player}`,
      };
    }

    return {
      result: true,
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
