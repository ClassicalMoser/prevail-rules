import type { Board, GameState } from '@entities';
import type { StartEngagementEvent } from '@events';
import { hasSingleUnit } from '@entities';
import { GAME_EFFECT_EVENT_TYPE, START_ENGAGEMENT_EFFECT_TYPE } from '@events';
import {
  getBoardSpace,
  getMovementResolutionState,
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
  state: GameState<TBoard>,
): StartEngagementEvent<TBoard, 'startEngagement'> {
  const movementResolutionState = getMovementResolutionState(state);

  // Get the engaging unit's facing from its target placement
  const engagingFacing = movementResolutionState.targetPlacement.facing;

  // Get the defending unit's facing from the board
  const board = state.boardState;
  const targetSpace = getBoardSpace(
    board,
    movementResolutionState.targetPlacement.coordinate,
  );

  if (!hasSingleUnit(targetSpace.unitPresence)) {
    throw new Error('Target space does not have a single unit');
  }

  const defendingFacing = targetSpace.unitPresence.facing;
  const defenderWithPlacement = {
    unit: targetSpace.unitPresence.unit,
    placement: {
      coordinate: movementResolutionState.targetPlacement.coordinate,
      facing: defendingFacing,
    },
  };

  // Check engagement type in priority order: rear, flank, front
  // Rear is most severe, so check it first
  const rearCheck = isEngagementFromRear(engagingFacing, defendingFacing);
  if (rearCheck.result) {
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: START_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'rear',
      defenderWithPlacement,
    };
  }

  const flankCheck = isEngagementFromFlank(engagingFacing, defendingFacing);
  if (flankCheck.result) {
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: START_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'flank',
      defenderWithPlacement,
    };
  }

  const frontCheck = isEngagementFromFront(engagingFacing, defendingFacing);
  if (frontCheck.result) {
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: START_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'front',
      defenderWithPlacement,
    };
  }

  // If none of the checks passed, this is an invalid state
  throw new Error(
    `Unable to determine engagement type. Engaging facing: ${engagingFacing}, Defending facing: ${defendingFacing}`,
  );
}
