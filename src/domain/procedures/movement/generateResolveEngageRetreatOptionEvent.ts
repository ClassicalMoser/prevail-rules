import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
} from '@events';
import { getLegalRetreats } from '@legality';
import {
  getCurrentUnitStat,
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
  modifiersFromCompletedCommitment,
} from '@queries';
/**
 * Generates a ResolveEngageRetreatOptionEvent by working out the retreats the
 * defending unit may make during a front engagement.
 *
 * @param state - The current game state
 * @returns A complete ResolveEngageRetreatOptionEvent carrying each retreat as
 * its path. There are some only if the defending unit has a higher current speed
 * value than the engaging unit, and a legal retreat to make; otherwise the
 * list is empty and the defender stands. Each player's committed card applies
 * only to their own unit.
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveEngageRetreatOptionEvent(
  state: GameState,
): ResolveEngageRetreatOptionEvent {
  const movementResolutionState = getMovementResolutionState(state);
  const engagementState = getFrontEngagementStateFromMovement(state);

  const defender = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );
  const defendingUnit = defender.unit;
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

  // The defender may fall back only if it is strictly the faster (§6.3.2),
  // and only if it has somewhere to fall back to (§9.1): a retreat it could
  // not make is not offered, so the choice never turns into a rout. The
  // card the defender committed counts toward the retreat it is weighing,
  // as it did toward the Speed it is compared on (§6.3.2).
  const outpacesEngager = defendingSpeed > engagingSpeed;
  const retreatPaths = outpacesEngager
    ? getLegalRetreats(defender, state, defendingCommitmentModifiers)
    : [];

  return {
    effectType: RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    retreatPaths,
  };
}
