import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
} from '@events';
import { getLegalRetreats } from '@legality';
import {
  findPlayerUnitWithPosition,
  getCurrentUnitStat,
  getFrontEngagementStateFromMovement,
  getOtherPlayer,
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
  const engagementState = getFrontEngagementStateFromMovement(state);
  const { engagingUnit } = engagementState;

  // The defender shares its space with the engaging unit, which entered it
  // as the engagement started; it is the other side's unit there.
  const defender = findPlayerUnitWithPosition(
    state.boardState,
    engagementState.targetPlacement.coordinate,
    getOtherPlayer(engagingUnit.playerSide),
  );
  if (defender === undefined) {
    throw new Error('No defender stands in the engaged space');
  }
  const defendingUnit = defender.unit;

  const defendingCommitmentModifiers = modifiersFromCompletedCommitment(
    engagementState.engagementResolutionState.defensiveCommitment,
  );

  const defendingSpeed = getCurrentUnitStat(
    defendingUnit,
    'speed',
    state,
    defendingCommitmentModifiers,
  );

  // The engaging unit's Speed was sampled where its move began, its own
  // card counted, and recorded as the engagement started (§5.1.4); it now
  // stands in the defender's space, where a fresh reading would be wrong.
  const { engagingSpeed } = engagementState.engagementResolutionState;

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
