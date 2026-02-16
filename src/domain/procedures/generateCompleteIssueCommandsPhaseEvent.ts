import type { Board, BoardCoordinate, GameState } from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { hasEngagedUnits } from '@entities';
import {
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getBoardCoordinates, getBoardSpace } from '@queries';

/**
 * Generates a CompleteIssueCommandsPhaseEvent to complete the issue commands phase
 * and advance to resolve melee phase.
 * Scans the board to find all coordinates where engagements exist.
 *
 * @param state - The current game state
 * @returns A complete CompleteIssueCommandsPhaseEvent with engagement locations
 */
export function generateCompleteIssueCommandsPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteIssueCommandsPhaseEvent<TBoard, 'completeIssueCommandsPhase'> {
  // Find all engagements on the board
  const engagements = new Set<BoardCoordinate<Board>>();
  const coordinates = getBoardCoordinates(state.boardState);

  for (const coordinate of coordinates) {
    const space = getBoardSpace(state.boardState, coordinate);
    if (hasEngagedUnits(space.unitPresence)) {
      engagements.add(coordinate);
    }
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
    engagements,
  };
}
