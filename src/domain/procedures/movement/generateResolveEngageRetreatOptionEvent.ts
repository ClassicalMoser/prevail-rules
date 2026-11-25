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
  getMovementResolutionState,
  getOtherPlayer,
  modifiersFromCompletedCommitment,
} from '@queries';
import { throwIfPending } from '@utils';
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
  // Only a front defender may be offered the chance to fall back (§6.3.2);
  // a flank defender may not retreat and a rear one routs (§6.3.4, §6.3.3).
  // Asked during either, or with no engagement, the getter throws.
  const engagementState = getFrontEngagementStateFromMovement(state);
  const { movingUnit: engagingUnit, targetPlacement } =
    getMovementResolutionState(state);

  // The defender shares the space the move ends in with the engaging unit,
  // which entered it as the engagement started; it is the other side's unit
  // there.
  // An engagement starts only from a move already written, so the move is
  // written whenever a front engagement is under way.
  // TODO(composition): this finding of the defender, from the move's end
  // space and the other side, is written again in
  // `applyOpenRetreatFromEngagementEvent`, throws and all. Settle with one
  // `@queries` reader for the defender of the front engagement under way,
  // asked by both.
  const engagedSpace = throwIfPending(
    targetPlacement,
    'The move has not been written yet',
  );
  const defender = findPlayerUnitWithPosition(
    state.boardState,
    engagedSpace.coordinate,
    getOtherPlayer(engagingUnit.playerSide),
  );

  // A front engagement leaves both units in the space until the defender
  // falls back (§6.3.2), so a space without the defender is a fault in
  // whatever wrote the board.
  if (defender === undefined) {
    throw new Error('No defender stands in the engaged space');
  }
  const defendingUnit = defender.unit;

  // The defender may have committed a card for +1 Speed or +1 Flexibility
  // before the comparison (§6.3.2 step 1, §8.4). A card it committed counts
  // toward its own unit only (§8.4.1); a declined one lends nothing.
  const defendingCommitmentModifiers = modifiersFromCompletedCommitment(
    engagementState.engagementResolutionState.defensiveCommitment,
  );

  // The defender's Speed is read here and now, where it stands, with its
  // card counted: this is the start of the retreat it is weighing, so its
  // move samples its Speed here (§6.3.2 step 2, §5.1.4).
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

  // The retreats are what this procedure worked out, so the event carries
  // them; an empty list says the defender stands and fights in Phase 4
  // (§6.3.2 step 4).
  const event: ResolveEngageRetreatOptionEvent = {
    effectType: RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    retreatPaths,
  };

  // The defender's options, for the transform to record on the engagement,
  // or to close it when there are none.
  return event;
}
