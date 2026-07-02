import type { Board } from '@entities';
import type { StartEngagementEventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { GAME_EFFECT_EVENT_TYPE, START_ENGAGEMENT_EFFECT_TYPE } from '@events';
import {
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
  isEngagementFromFlank,
  isEngagementFromFront,
  isEngagementFromRear,
} from '@queries';
/**
 * Generates a StartEngagementEvent by determining the engagement type
 * based on the relative facing of the engaging unit and defending unit.
 * Checks in priority order: rear, flank, front.
 * This is called when a unit first moves into an enemy space.
 *
 * @param state - The current game state
 * @returns A complete StartEngagementEvent with engagement type and `defenderWithPlacement`
 * @throws Error if not in issueCommands phase, no movement resolution, or no enemy unit at target
 */
export function generateStartEngagementEvent<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  eventNumber: number,
): StartEngagementEventForBoard<TBoard> {
  const movementResolutionState = getMovementResolutionState(state);

  // Get the engaging unit's facing from its target placement
  const engagingFacing = movementResolutionState.targetPlacement.facing;

  const defenderWithPlacement = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    movementResolutionState.targetPlacement.coordinate,
  );
  const defendingFacing = defenderWithPlacement.placement.facing;

  // Check engagement type in priority order: rear, flank, front
  // Rear is most severe, so check it first
  const rearCheck = isEngagementFromRear(engagingFacing, defendingFacing);
  const { boardType } = state.boardState;

  if (rearCheck.result) {
    return {
      boardType,
      defenderWithPlacement,
      effectType: START_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'rear',
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
  }

  const flankCheck = isEngagementFromFlank(engagingFacing, defendingFacing);
  if (flankCheck.result) {
    return {
      boardType,
      defenderWithPlacement,
      effectType: START_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'flank',
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
  }

  const frontCheck = isEngagementFromFront(engagingFacing, defendingFacing);
  if (frontCheck.result) {
    return {
      boardType,
      defenderWithPlacement,
      effectType: START_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'front',
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
  }

  // If none of the checks passed, this is an invalid state
  throw new Error(
    `Unable to determine engagement type. Engaging facing: ${engagingFacing}, Defending facing: ${defendingFacing}`,
  );
}
