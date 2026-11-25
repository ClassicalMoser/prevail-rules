import type { StartEngagementEvent } from '@events';
import type { GameState } from '@game';
import {
  createOpenedEngagementState,
  createOpenedFlankEngagementResolutionState,
  createOpenedFrontEngagementResolutionState,
  createOpenedRearEngagementResolutionState,
} from '@factories';
import {
  getMovementResolutionState,
  getUnitWithPlacementOnBoard,
} from '@queries';
import {
  carryRidingCommander,
  moveUnitIntoEngagement,
  moveUnitOnBoard,
  removeUnitsLeavingUnderRout,
  updateEngagementStateInMovement,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Applies a StartEngagementEvent to the game state.
 * Creates an engagement state in the movement resolution state with the appropriate resolution state.
 * From the front or the rear the engaging unit is set down at once; from the
 * flank, once the defender has been turned.
 * The procedure names the defender by who it is; it stands in the space the
 * move ends in, which the movement records.
 *
 * @param event - The start engagement event to apply
 * @param state - The current game state
 * @returns A new game state with the engagement state created
 */
export function applyStartEngagementEvent<S extends GameState>(
  event: StartEngagementEvent,
  state: S,
): S {
  // The move whose unit has just walked into an enemy's space (§6.1.1).
  const movementState = getMovementResolutionState(state);

  // The engagement starts from a move already written into the enemy.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );

  // The unit that was already there is the defender, named by the event and
  // taken as the board holds it, so a forged copy cannot enter the rout; the
  // unit that moved in is the engaging unit (§6.1.3).
  const defendingUnit = getUnitWithPlacementOnBoard(
    state,
    event.defendingUnit,
  ).unit;
  const engagingUnit = movementState.movingUnit;

  // How the engaging unit meets the defender decides how the engagement opens.
  const engagementResolutionState = (() => {
    switch (event.engagementType) {
      case 'rear': {
        // From the rear the defender routs at once (§6.3.3); its penalty is
        // filled in by resolveRout.
        const rear = createOpenedRearEngagementResolutionState(defendingUnit);
        return rear;
      }
      case 'flank': {
        // From the flank the defender will be turned to face the engager
        // (§6.3.4).
        const flank = createOpenedFlankEngagementResolutionState();
        return flank;
      }
      case 'front': {
        // Head-on the defender may commit, then may be offered a retreat
        // (§6.3.2), compared against the engaging unit's Speed as it was
        // sampled where its move began.
        const front = createOpenedFrontEngagementResolutionState(
          event.engagingSpeed,
        );
        return front;
      }
      default: {
        // Exhaustiveness check for TypeScript
        // The three kinds cover every way two facings meet once a front
        // approach has squared up (§6.3.1); any other value is a forged event.
        const _exhaustive: never = event.engagementType;
        throw new Error(`Unknown engagement type: ${_exhaustive}`);
      }
    }
  })();

  // The engagement goes on the move, open, for its kind's next step: the
  // front defender's commitment, the flank defender's turn, or the rear
  // defender's Morale.
  const engagementState = createOpenedEngagementState(
    engagementResolutionState,
  );

  const withEngagement = updateEngagementStateInMovement(
    state,
    engagementState,
  );

  // From the front, the engaging unit enters the defender's space at once,
  // and the two stand engaged while the defender decides whether to fall
  // back (§6.3.2). A commander riding with it arrives too (§4.3.10). If the
  // defender falls back, the engaging unit holds the space alone.
  if (event.engagementType === 'front') {
    const joined = moveUnitIntoEngagement(
      withEngagement,
      engagingUnit,
      targetPlacement,
    );
    const frontOpened = carryRidingCommander(
      joined,
      movementState,
      targetPlacement.coordinate,
    );

    // The two units locked together while the defender decides.
    return frontOpened;
  }

  // From the flank, the defender is turned first, and the engaging unit set
  // down with it then (resolveFlankEngagement).
  // TODO(composition): the kind is decided twice, by the switch above and by
  // these branches on the board, and here the flank is named only as "not
  // rear". One switch per kind, opening the engagement and placing the units,
  // would read as §6.3.2–§6.3.4 do.
  if (event.engagementType !== 'rear') {
    // Nobody has moved yet: the engaging unit waits on its start space.
    return withEngagement;
  }

  // A rear engagement opens a rout immediately, and the defender leaves the
  // board then (§6.3.3).
  // Its own commander, if it stood with it, falls with it (§4.2.8).
  const defenderGone = removeUnitsLeavingUnderRout(withEngagement, [
    defendingUnit,
  ]);
  // The attacker steps into the space it left, so it stands where it
  // fought before the defender's owner is asked for the Morale. A commander
  // riding with it arrives too (§4.3.10).
  const stepped = moveUnitOnBoard(defenderGone, engagingUnit, targetPlacement);
  const rearResolved = carryRidingCommander(
    stepped,
    movementState,
    targetPlacement.coordinate,
  );

  // The attacker alone in the space, its defender's Morale owed.
  return rearResolved;
}
