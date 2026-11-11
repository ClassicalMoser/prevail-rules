import type { StartEngagementEvent } from '@events';
import type {
  EngagementResolutionState,
  EngagementState,
  GameState,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@game';
import {
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import {
  addUnitToBoard,
  carryRidingCommander,
  removeUnitFromBoard,
  removeUnitsLeavingUnderRout,
  updateBoardState,
  updatePhaseState,
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
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);

  // The engagement starts from a move already written into the enemy.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );
  const defendingUnit = event.defenderWithPlacement.unit;
  const engagingUnit = movementState.movingUnit.unit;
  const defendingPlayer = defendingUnit.playerSide;

  // Create the appropriate engagement resolution state based on engagement type
  const engagementResolutionState: EngagementResolutionState = (() => {
    switch (event.engagementType) {
      case 'rear': {
        // Rear engagement: seed rout; penalty filled by resolveRout
        return {
          completed: false,
          engagementType: 'rear' as const,
          routState: {
            cardsChosen: false,
            completed: false,
            numberToDiscard: 'pending',
            player: defendingPlayer,
            substepType: 'rout' as const,
            unitsToRout: [defendingUnit],
          },
        };
      }
      case 'flank': {
        // Flank engagement: defender will be rotated
        return {
          defenderRotated: false,
          engagementType: 'flank' as const,
        };
      }
      case 'front': {
        // Front engagement: requires check for defensive commitment
        return {
          defendingUnitCanRetreat: 'pending',
          defendingUnitRetreats: 'pending',
          defensiveCommitment: { commitmentType: 'pending' as const },
          engagementType: 'front' as const,
          retreatState: 'pending',
        };
      }
      default: {
        // Exhaustiveness check for TypeScript
        const _exhaustive: never = event.engagementType;
        throw new Error(`Unknown engagement type: ${_exhaustive}`);
      }
    }
  })();

  // Create engagement state
  const engagementState: EngagementState = {
    completed: false,
    engagementResolutionState,
    engagingUnit,
    substepType: 'engagementResolution' as const,
    targetPlacement,
  };

  // Update movement resolution state
  const newMovementState: MovementResolutionState = {
    ...movementState,
    engagementState,
  };

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  const withEngagement = updatePhaseState(state, newPhaseState);

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
      addUnitToBoard(
        removeUnitFromBoard(defenderGone.boardState, movementState.movingUnit),
        arrived,
      ),
      movementState,
      targetPlacement.coordinate,
    ),
  );
  // The movement records where the mover now stands.
  const placedPhaseState: IssueCommandsPhaseState = {
    ...newPhaseState,
    currentCommandResolutionState: { ...newMovementState, movingUnit: arrived },
  };
  const rearResolved = updatePhaseState(attackerPlaced, placedPhaseState);
  return rearResolved;
}
