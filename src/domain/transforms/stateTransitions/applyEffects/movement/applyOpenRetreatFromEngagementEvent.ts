import type { OpenRetreatFromEngagementEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRetreatState } from '@factories';
import {
  findPlayerUnitWithPosition,
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
  getOtherPlayer,
} from '@queries';
import { throwIfPending, throwIfUndefined } from '@utils';
import { updateFrontEngagementResolutionState } from '@transforms/pureTransforms';

/**
 * Applies an OpenRetreatFromEngagementEvent: the retreat of a defender that
 * chose to fall back from a front engagement (§6.3.2) is opened, with the
 * retreats the engagement recorded when it worked out the retreat option.
 *
 * Event is assumed pre-validated (a front engagement whose defender chose to
 * retreat, and whose retreat is not yet open).
 *
 * @param _event - The event carries nothing; the paths are the engagement's
 * @param state - The current game state
 * @returns A new game state with the defender's retreat open
 */
export function applyOpenRetreatFromEngagementEvent<S extends GameState>(
  _event: OpenRetreatFromEngagementEvent,
  state: S,
): S {
  // Only a front defender may fall back (§6.3.2); asked during a flank or
  // rear engagement, or with none under way, the getter throws.
  const engagementState = getFrontEngagementStateFromMovement(state);

  // The defender still stands in the space the move ends in, sharing it
  // with the engaging unit; it is the other side's unit there.
  // TODO(composition): this finding of the defender, from the move's end
  // space and the other side, is written again in
  // `generateResolveEngageRetreatOptionEvent`, throws and all. Settle with
  // one `@queries` reader for the defender of the front engagement under
  // way, asked by both.
  const { movingUnit: engagingUnit, targetPlacement } =
    getMovementResolutionState(state);
  const engagedSpace = throwIfPending(
    targetPlacement,
    'The move has not been written yet',
  );

  // The defender was already in the space when the engaging unit walked in
  // (§6.1.3), so it is the other side's.
  const defendingSide = getOtherPlayer(engagingUnit.playerSide);
  const found = findPlayerUnitWithPosition(
    state.boardState,
    engagedSpace.coordinate,
    defendingSide,
  );

  // A front engagement leaves both units in the space until the defender
  // falls back (§6.3.2), so a space without the defender is a fault in
  // whatever wrote the board.
  const defender = throwIfUndefined(
    found,
    'No defender stands in the engaged space',
  );

  // The retreats were worked out when the retreat option was resolved. A
  // defender with nowhere to fall back to stands, and no retreat opens for
  // that defender (§6.3.2, §9.1.5), so one is opened only with a way back.
  const retreatPaths = throwIfPending(
    engagementState.engagementResolutionState.retreatPaths,
    'The retreat option has not been resolved yet',
  );
  if (retreatPaths.length === 0) {
    throw new Error(
      'A defender with nowhere to retreat stands; no retreat opens',
    );
  }

  // The retreats are written as the engagement recorded them.
  // The board's own copy of the defender falls back. One retreat is no
  // choice and is taken as it stands; several equally small ones are the
  // defender's owner's to choose among (§9.1.3).
  const retreatState = createOpenedRetreatState(defender.unit, retreatPaths);

  // The retreat goes on the front engagement under way, which ends once the
  // defender has fallen back, with no melee (§6.3.2 step 3).
  const opened = updateFrontEngagementResolutionState(state, { retreatState });

  // The engagement, with the defender's retreat open for it to carry out.
  return opened;
}
