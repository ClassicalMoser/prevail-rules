import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
} from '@events';
import {
  getCurrentUnitStat,
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
  modifiersFromCompletedCommitment,
} from '@queries';
/**
 * Generates a ResolveEngageRetreatOptionEvent by determining if the defending unit
 * can retreat during a front engagement.
 *
 * @param state - The current game state
 * @returns A complete ResolveEngageRetreatOptionEvent. Retreat is possible if the defending
 * unit has a higher current speed value than the engaging unit. Each player's committed
 * card applies only to their own unit.
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveEngageRetreatOptionEvent(
  state: GameState,
  eventNumber: number,
): ResolveEngageRetreatOptionEvent {
  const movementResolutionState = getMovementResolutionState(state);
  const engagementState = getFrontEngagementStateFromMovement(state);

  const { unit: defendingUnit } = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );
  const { engagingUnit } = engagementState;

  const engagingCommitmentModifiers = modifiersFromCompletedCommitment(
    movementResolutionState.commitment,
  );
  const defendingCommitmentModifiers = modifiersFromCompletedCommitment(
    engagementState.engagementResolutionState.defensiveCommitment,
  );

  const defendingSpeed = getCurrentUnitStat(
    defendingUnit,
    'speed',
    state,
    defendingCommitmentModifiers,
  );

  const engagingSpeed = getCurrentUnitStat(
    engagingUnit,
    'speed',
    state,
    engagingCommitmentModifiers,
  );

  // Retreat is possible if defending unit has higher speed than engaging unit
  const defendingUnitCanRetreat = defendingSpeed > engagingSpeed;

  return {
    defendingUnitCanRetreat,
    effectType: RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
