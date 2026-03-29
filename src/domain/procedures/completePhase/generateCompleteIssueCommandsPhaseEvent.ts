import type { Board } from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getBoardCoordinatesWithEngagedUnits } from '@queries';

/**
 * Generates a CompleteIssueCommandsPhaseEvent to complete the issue commands phase
 * and advance to resolve melee phase.
 *
 * `remainingEngagements` is computed from the board so replay can apply the event
 * without re-scanning.
 *
 * @param state - The current game state
 * @returns A complete CompleteIssueCommandsPhaseEvent
 */
export function generateCompleteIssueCommandsPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
): CompleteIssueCommandsPhaseEvent<TBoard, 'completeIssueCommandsPhase'> {
  const remainingEngagements = getBoardCoordinatesWithEngagedUnits(
    state.boardState,
  );

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
    eventNumber,
    remainingEngagements,
  };
}
