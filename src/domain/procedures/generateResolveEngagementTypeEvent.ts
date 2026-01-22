import type { Board, GameState } from '@entities';
import type { ResolveEngagementTypeEvent } from '@events';
import { hasSingleUnit } from '@entities';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_ENGAGEMENT_EFFECT_TYPE,
} from '@events';
import {
  getBoardSpace,
  isEngagementFromFlank,
  isEngagementFromFront,
  isEngagementFromRear,
} from '@queries';

/**
 * Generates a ResolveEngagementTypeEvent by determining the engagement type
 * based on the relative facing of the engaging unit and defending unit.
 * Checks in priority order: rear, flank, front.
 *
 * @param state - The current game state
 * @returns A complete ResolveEngagementTypeEvent with the determined engagement type
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveEngagementTypeEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveEngagementTypeEvent<TBoard, 'resolveEngagementType'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'issueCommands') {
    throw new Error('Current phase is not issueCommands');
  }

  if (!phaseState.currentCommandResolutionState) {
    throw new Error('No current command resolution state');
  }

  if (
    phaseState.currentCommandResolutionState.commandResolutionType !==
    'movement'
  ) {
    throw new Error('Current command resolution is not a movement');
  }

  const movementResolutionState = phaseState.currentCommandResolutionState;
  const engagementState = movementResolutionState.engagementState;

  if (!engagementState) {
    throw new Error('No engagement state found');
  }

  // Get the engaging unit's facing from its target placement
  const engagingFacing = engagementState.targetPlacement.facing;

  // Get the defending unit's facing from the board
  const board = state.boardState;
  const targetSpace = getBoardSpace(
    board,
    engagementState.targetPlacement.coordinate,
  );

  if (!hasSingleUnit(targetSpace.unitPresence)) {
    throw new Error('Defending space does not have a single unit');
  }

  const defendingFacing = targetSpace.unitPresence.facing;

  // Check engagement type in priority order: rear, flank, front
  // Rear is most severe, so check it first
  const rearCheck = isEngagementFromRear(engagingFacing, defendingFacing);
  if (rearCheck.result) {
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: RESOLVE_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'rear',
    };
  }

  const flankCheck = isEngagementFromFlank(engagingFacing, defendingFacing);
  if (flankCheck.result) {
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: RESOLVE_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'flank',
    };
  }

  const frontCheck = isEngagementFromFront(engagingFacing, defendingFacing);
  if (frontCheck.result) {
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: RESOLVE_ENGAGEMENT_EFFECT_TYPE,
      engagementType: 'front',
    };
  }

  // If none of the checks passed, this is an invalid state
  throw new Error(
    `Unable to determine engagement type. Engaging facing:
    ${engagingFacing}, Defending facing: ${defendingFacing}`,
  );
}
