import type { StartEngagementEvent } from '@events';
import type { GameState } from '@game';
import {
  createOpenedEngagementState,
  createOpenedFlankEngagementResolutionState,
  createOpenedFrontEngagementResolutionState,
  createOpenedRearEngagementResolutionState,
} from '@factories';
import { getMovementResolutionState } from '@queries';
import {
  carryRidingCommander,
  moveUnitOnBoard,
  removeUnitsLeavingUnderRout,
  updateBoardState,
  updateCommandResolutionState,
  updateEngagementStateInMovement,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Applies a StartEngagementEvent to the game state.
 * Creates an engagement state in the movement resolution state with the appropriate resolution state.
 * Uses `event.defenderWithPlacement` from the procedure; does not scan the target space or
 * resolve placement via `getPositionOfUnit`.
 *
 * @param event - The start engagement event to apply
 * @param state - The current game state
 * @returns A new game state with the engagement state created
 */
export function applyStartEngagementEvent<S extends GameState>(
  event: StartEngagementEvent,
  state: S,
): S {
  const movementState = getMovementResolutionState(state);

  // The engagement starts from a move already written into the enemy.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );
  const defendingUnit = event.defenderWithPlacement.unit;
  const engagingUnit = movementState.movingUnit.unit;

  // How the engaging unit meets the defender decides how the engagement opens.
  const engagementResolutionState = (() => {
    switch (event.engagementType) {
      case 'rear': {
        // From the rear the defender routs at once (§6.3.3); its penalty is
        // filled in by resolveRout.
        return createOpenedRearEngagementResolutionState(defendingUnit);
      }
      case 'flank': {
        // From the flank the defender will be turned to face the engager
        // (§6.3.4).
        return createOpenedFlankEngagementResolutionState();
      }
      case 'front': {
        // Head-on the defender may commit, then may be offered a retreat
        // (§6.3.2).
        return createOpenedFrontEngagementResolutionState();
      }
      default: {
        // Exhaustiveness check for TypeScript
        const _exhaustive: never = event.engagementType;
        throw new Error(`Unknown engagement type: ${_exhaustive}`);
      }
    }
  })();
  const engagementState = createOpenedEngagementState(
    engagementResolutionState,
    engagingUnit,
    targetPlacement,
  );

  const withEngagement = updateEngagementStateInMovement(
    state,
    engagementState,
  );

  if (event.engagementType !== 'rear') {
    return withEngagement;
  }

  // A rear engagement opens a rout immediately, and the defender leaves the
  // board then (§6.3.3).
  const defenderGone = removeUnitsLeavingUnderRout(withEngagement, [
    defendingUnit,
  ]);
  // The attacker steps into the space it left, so it stands where it
  // fought before the defender's owner is asked for the Morale. A commander
  // riding with it arrives too (§4.3.10).
  const arrived = {
    placement: targetPlacement,
    unit: engagingUnit,
  };
  const attackerPlaced = updateBoardState(
    defenderGone,
    carryRidingCommander(
      moveUnitOnBoard(defenderGone.boardState, engagingUnit, targetPlacement),
      movementState,
      targetPlacement.coordinate,
    ),
  );
  // The movement records where the mover now stands.
  const rearResolved = updateCommandResolutionState(attackerPlaced, {
    ...getMovementResolutionState(attackerPlaced),
    movingUnit: arrived,
  });
  return rearResolved;
}
