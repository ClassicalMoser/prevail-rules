import type { Coordinate } from '@ruleValues';
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
export function generateCompleteIssueCommandsPhaseEvent(
  state: GameState,
): CompleteIssueCommandsPhaseEvent {
  // Every engaged space fights in Phase 4, and no fight may be skipped
  // (§4.4.1). Orders are over, so no engagement can begin or end before
  // then: the spaces engaged now are the fights Phase 4 owes. The first
  // player picks the order they are fought in (§4.4.2), so these are a set.
  const remainingEngagements: Set<Coordinate> =
    getBoardCoordinatesWithEngagedUnits(state.boardState);

  // The event records the fights, so the apply starts Phase 4 with them and
  // never scans the board itself. The query walks the board in board order,
  // so the list comes out in that order, stable but meaning nothing.
  const event: CompleteIssueCommandsPhaseEvent = {
    effectType: COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    remainingEngagements: [...remainingEngagements],
  };

  // Phase 3 ends, carrying the fights Phase 4 owes.
  return event;
}
