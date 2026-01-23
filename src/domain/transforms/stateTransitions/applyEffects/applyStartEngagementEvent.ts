import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { StartEngagementEvent } from '@events';
import { hasSingleUnit } from '@entities';
import {
  getBoardSpace,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a StartEngagementEvent to the game state.
 * Creates an engagement state in the movement resolution state with the appropriate resolution state.
 *
 * @param event - The start engagement event to apply
 * @param state - The current game state
 * @returns A new game state with the engagement state created
 */
export function applyStartEngagementEvent<TBoard extends Board>(
  event: StartEngagementEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);

  // Get the defending unit from the board
  const board = state.boardState;
  const targetSpace = getBoardSpace(
    board,
    movementState.targetPlacement.coordinate,
  );

  if (!hasSingleUnit(targetSpace.unitPresence)) {
    throw new Error('Target space does not have a single unit');
  }

  const defendingUnit = targetSpace.unitPresence.unit;
  const engagingUnit = movementState.movingUnit.unit;
  const defendingPlayer = defendingUnit.playerSide;

  // Create the appropriate engagement resolution state based on engagement type
  const engagementResolutionState = (() => {
    switch (event.engagementType) {
      case 'rear': {
        // Rear engagement: create rout state immediately
        return {
          engagementType: 'rear' as const,
          routState: {
            substepType: 'rout' as const,
            player: defendingPlayer,
            unitsToRout: new Set([defendingUnit]),
            numberToDiscard: defendingUnit.unitType.routPenalty,
            cardsChosen: false,
            completed: false,
          },
          completed: false,
        };
      }
      case 'flank': {
        // Flank engagement: defender will be rotated
        return {
          engagementType: 'flank' as const,
          defenderRotated: false,
        };
      }
      case 'front': {
        // Front engagement: requires check for defensive commitment
        return {
          engagementType: 'front' as const,
          defensiveCommitment: { commitmentType: 'pending' as const },
          defendingUnitCanRetreat: undefined,
          defendingUnitRetreats: undefined,
          defendingUnitRetreated: undefined,
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
  const engagementState = {
    substepType: 'engagementResolution' as const,
    engagingUnit,
    targetPlacement: movementState.targetPlacement,
    engagementResolutionState,
    completed: false,
  };

  // Update movement resolution state
  const newMovementState = {
    ...movementState,
    engagementState,
  };

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(state, newPhaseState);
}
