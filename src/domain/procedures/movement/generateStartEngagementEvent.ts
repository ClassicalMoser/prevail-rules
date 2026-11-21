import type { StartEngagementEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, START_ENGAGEMENT_EFFECT_TYPE } from '@events';
import {
  findEngagementType,
  getCurrentUnitStat,
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
  modifiersFromCompletedCommitment,
} from '@queries';
import { throwIfPending } from '@utils';
/**
 * Generates a StartEngagementEvent by determining the engagement type
 * based on the relative facing of the engaging unit and defending unit.
 * The rear is read first, then the flank, then the front ({@link findEngagementType}).
 * This is called when a unit first moves into an enemy space.
 *
 * @param state - The current game state
 * @returns A complete StartEngagementEvent with engagement type, the
 * defending unit, named by who it is, and the engaging unit's Speed
 * @throws Error if not in issueCommands phase, no movement resolution, or no enemy unit at target
 */
export function generateStartEngagementEvent(
  state: GameState,
): StartEngagementEvent {
  const movementResolutionState = getMovementResolutionState(state);

  // Get the engaging unit's facing from its target placement
  // An engagement is only started once the move into the enemy is written.
  const targetPlacement = throwIfPending(
    movementResolutionState.targetPlacement,
    'The move has not been written yet',
  );
  const engagingFacing = targetPlacement.facing;

  const defenderWithPlacement = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    targetPlacement.coordinate,
  );
  const defendingFacing = defenderWithPlacement.placement.facing;

  // How the engaging unit meets the defender decides what the engagement is.
  const engagementType = findEngagementType(engagingFacing, defendingFacing);
  // Rear, flank and front cover six of the eight ways two facings can meet.
  // The other two, 45° off head-on, cannot happen: a front approach squares
  // up head-on as part of the engaging move (§6.2.3, `getEngagementEndFacing`).
  // Reaching them means that guarantee broke.
  if (engagementType === undefined) {
    throw new Error(
      `Unable to determine engagement type. Engaging facing: ${engagingFacing}, Defending facing: ${defendingFacing}`,
    );
  }
  // The engaging unit's Speed for this move, sampled where the move began,
  // its own committed card counted (§5.1.4, §4.3.10). It still stands on
  // that space now; once the engagement starts it stands in the defender's,
  // so this is the moment to read it.
  const engagingSpeed = getCurrentUnitStat(
    movementResolutionState.movingUnit,
    'speed',
    state,
    modifiersFromCompletedCommitment(movementResolutionState.commitment),
  );

  // The defender is named by who it is: it stands in the space the move
  // ends in, which the movement records, and faces as the board says.
  return {
    defendingUnit: defenderWithPlacement.unit,
    engagingSpeed,
    effectType: START_ENGAGEMENT_EFFECT_TYPE,
    engagementType,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
