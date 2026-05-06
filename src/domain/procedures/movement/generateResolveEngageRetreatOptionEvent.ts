import type { Board } from "@entities";
import type { ResolveEngageRetreatOptionEvent } from "@events";
import type { GameStateForBoard } from "@game";
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE } from "@events";
import {
  getCurrentUnitStat,
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
  modifiersFromCompletedCommitment,
} from "@queries";

/**
 * Generates a ResolveEngageRetreatOptionEvent by determining if the defending unit
 * can retreat during a front engagement.
 *
 * @param state - The current game state
 * @returns A complete ResolveEngageRetreatOptionEvent. Retreat is possible if the defending
 * unit has a higher current speed value than the engaging unit.
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveEngageRetreatOptionEvent<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  eventNumber: number,
): ResolveEngageRetreatOptionEvent {
  const movementResolutionState = getMovementResolutionState(state);
  const engagementState = getFrontEngagementStateFromMovement(state);

  const { unit: defendingUnit } = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );
  const engagingUnit = engagementState.engagingUnit;

  const commitmentModifiers = modifiersFromCompletedCommitment(movementResolutionState.commitment);

  // Get current speed values for both units
  const defendingSpeed = getCurrentUnitStat(defendingUnit, "speed", state, commitmentModifiers);

  const engagingSpeed = getCurrentUnitStat(engagingUnit, "speed", state, commitmentModifiers);

  // Retreat is possible if defending unit has higher speed than engaging unit
  const defendingUnitCanRetreat = defendingSpeed > engagingSpeed;

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
    eventNumber,
    defendingUnitCanRetreat,
  };
}
