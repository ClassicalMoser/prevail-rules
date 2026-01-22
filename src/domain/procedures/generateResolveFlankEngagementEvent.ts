import type { Board, GameState } from '@entities';
import type { ResolveFlankEngagementEvent } from '@events';
import { hasSingleUnit } from '@entities';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
} from '@events';
import { getBoardSpace, getOppositeFacing } from '@queries';

/**
 * Generates a ResolveFlankEngagementEvent by calculating the new facing
 * for the defending unit in a flank engagement.
 * The defending unit is forced to rotate to face the engaging unit
 * (opposite of the engaging unit's facing).
 *
 * @param state - The current game state
 * @returns A complete ResolveFlankEngagementEvent with the rotated defending unit
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveFlankEngagementEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveFlankEngagementEvent<TBoard, 'resolveFlankEngagement'> {
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

  if (!engagementState.engagementResolutionState) {
    throw new Error('No engagement resolution state found');
  }

  if (engagementState.engagementResolutionState.engagementType !== 'flank') {
    throw new Error('Engagement type is not flank');
  }

  // Get the defending unit from the board
  const board = state.boardState;
  const targetSpace = getBoardSpace(
    board,
    engagementState.targetPlacement.coordinate,
  );

  if (!hasSingleUnit(targetSpace.unitPresence)) {
    throw new Error('Defending space does not have a single unit');
  }

  const defendingUnit = targetSpace.unitPresence.unit;

  // Get the engaging unit's facing
  const engagingFacing = engagementState.targetPlacement.facing;

  // Defending unit rotates to face the engaging unit (opposite of engaging unit's facing)
  const newFacing = getOppositeFacing(engagingFacing);

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
    defendingUnit,
    newFacing,
  };
}
