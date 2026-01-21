import type { Board, GameState } from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import {
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteIssueCommandsPhaseEvent to complete the issue commands phase
 * and advance to resolve melee phase.
 *
 * @param state - The current game state
 * @returns A complete CompleteIssueCommandsPhaseEvent
 */
export function generateCompleteIssueCommandsPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteIssueCommandsPhaseEvent<TBoard, 'completeIssueCommandsPhase'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  };
}
