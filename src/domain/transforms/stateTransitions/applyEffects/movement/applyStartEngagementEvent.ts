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
import { updatePhaseState } from '@transforms/pureTransforms';

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

  const defendingUnit = event.defenderWithPlacement.unit;
  const engagingUnit = movementState.movingUnit.unit;
  const defendingPlayer = defendingUnit.playerSide;

  // Create the appropriate engagement resolution state based on engagement type
  const engagementResolutionState: EngagementResolutionState = (() => {
    switch (event.engagementType) {
      case 'rear': {
        // Rear engagement: create rout state immediately
        return {
          completed: false,
          engagementType: 'rear' as const,
          routState: {
            cardsChosen: false,
            completed: false,
            numberToDiscard: defendingUnit.unitType.routPenalty,
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
          defendingUnitRetreated: 'pending',
          defendingUnitRetreats: 'pending',
          defensiveCommitment: { commitmentType: 'pending' as const },
          engagementType: 'front' as const,
        };
      }
      default: {
        // Exhaustiveness check for TypeScript
        const _exhaustive: never = event.engagementType;
        throw new Error(`Unknown engagement type: ${_exhaustive as string}`);
      }
    }
  })();

  // Create engagement state
  const engagementState: EngagementState = {
    completed: false,
    engagementResolutionState,
    engagingUnit,
    substepType: 'engagementResolution' as const,
    targetPlacement: movementState.targetPlacement,
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

  return updatePhaseState(state, newPhaseState);
}
