import type { OpenRetreatFromEngagementEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
} from '@events';
import { getLegalRetreats } from '@legality';
import {
  getFrontEngagementStateFromMovement,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';

/**
 * Builds the effect that opens a front-engaged defender's retreat, once it
 * has chosen to fall back (§6.3.2). The retreats it may make are worked out
 * here, from the board as it stands, and recorded on the event so the log
 * shows what was legal (§9.1). None means it routs instead (§9.1.6).
 *
 * @param state - A movement whose front engagement's defender chose to retreat
 * @param eventNumber - The ordered index of this event in the round
 * @returns The event, carrying each legal retreat as its path
 */
export function generateOpenRetreatFromEngagementEvent(
  state: GameState,
  eventNumber: number,
): OpenRetreatFromEngagementEvent {
  const engagementState = getFrontEngagementStateFromMovement(state);

  // The defender still stands in the space it was engaged in.
  const defender = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );
  const retreatPaths = getLegalRetreats(defender, state);

  const event: OpenRetreatFromEngagementEvent = {
    effectType: OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    retreatPaths,
  };
  return event;
}
