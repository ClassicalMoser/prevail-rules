import type {
  Board,
  ExpectedEventInfo,
  GameState,
  MovementResolutionState,
  PlayerSide,
} from '@entities';
import { getBoardSpace } from '@queries/boardSpace';
import { hasEnemyUnit } from '@validation';
import { getExpectedEngagementEvent } from '../composable';

/**
 * Gets the expected event for movement resolution substeps.
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param resolutionState - The movement resolution state
 * @param player - The player resolving the movement
 * @returns Information about what event is expected
 */
export function getExpectedMovementResolutionEvent<TBoard extends Board>(
  gameState: GameState<TBoard>,
  resolutionState: MovementResolutionState<TBoard>,
  player: PlayerSide,
): ExpectedEventInfo<TBoard> {
  // Fast rejection: if already completed, this is an invalid state
  if (resolutionState.completed) {
    throw new Error('Movement resolution state is already complete');
  }

  // Check commitment state
  if (resolutionState.commitment.commitmentType === 'pending') {
    // If the commitment has not been completed, that is what we expect next
    return {
      actionType: 'playerChoice',
      playerSource: player,
      choiceType: 'commitToMovement',
    };
  }

  // The commitment has been completed.
  // Before we can finish our movement,
  // we need to check if we are engaging an enemy unit

  const board = gameState.boardState;
  const targetSpace = getBoardSpace(
    board,
    resolutionState.targetPlacement.coordinate,
  );

  if (hasEnemyUnit(player, targetSpace)) {
    // If we are, we need to see if we've alredy started an engagement
    const engagementState = resolutionState.engagementState;
    if (!engagementState) {
      // If we haven't started an engagement, we need to start one
      return {
        actionType: 'gameEffect',
        effectType: 'startEngagement',
      };
    }
    // If we have an engagement state, we need to check if it is complete
    if (engagementState.completed) {
      // If the engagement is complete, we can finish our movement
      return {
        actionType: 'gameEffect',
        effectType: 'completeUnitMovement',
      };
    }
    // If the engagement state is not complete,
    // we need to get the expected engagement event
    return getExpectedEngagementEvent(gameState, engagementState);
  }

  // If we are not engaging an enemy unit, we can finish our movement
  return {
    actionType: 'gameEffect',
    effectType: 'completeUnitMovement',
  };
}
