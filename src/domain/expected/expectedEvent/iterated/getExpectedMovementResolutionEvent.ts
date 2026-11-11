import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import { getBoardSpace, hasEnemyUnit } from '@queries';
import { getExpectedEngagementEvent } from '../composable';

/**
 * Gets the expected event for movement resolution substeps.
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param resolutionState - The movement resolution state
 * @param player - The player resolving the movement
 * @returns Information about what event is expected
 */
export function getExpectedMovementResolutionEvent(
  gameState: GameState,
  resolutionState: MovementResolutionState,
  player: PlayerSide,
): ExpectedEventInfo {
  // Fast rejection: if already completed, this is an invalid state
  if (resolutionState.completed) {
    throw new Error('Movement resolution state is already complete');
  }

  // Check commitment state
  if (resolutionState.commitment.commitmentType === 'pending') {
    // If the commitment has not been completed, that is what we expect next
    return {
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: player,
    };
  }

  // With the card committed or declined, the move itself is written next
  // (§4.3.10): the commitment counts toward it, so it must come first.
  if (resolutionState.targetPlacement === 'pending') {
    return {
      actionType: 'playerChoice',
      choiceType: 'moveUnit',
      playerSource: player,
    };
  }

  // The move has been written.
  // An engagement already under way decides what comes next, whatever the
  // board now shows: a rear engagement routs its defender off the board the
  // moment it starts, yet its owner still owes the Morale (§6.3.3). Asking
  // the board first would see an empty space and end the move unpaid.
  const { engagementState } = resolutionState;
  if (engagementState !== 'pending') {
    // Once the engagement is settled, the move can finish.
    if (engagementState.completed) {
      return {
        actionType: 'gameEffect',
        effectType: 'completeUnitMovement',
      };
    }
    return getExpectedEngagementEvent(engagementState);
  }

  // No engagement yet: a move that ends on an enemy starts one (§6.1).
  const targetSpace = getBoardSpace(
    gameState.boardState,
    resolutionState.targetPlacement.coordinate,
  );
  if (hasEnemyUnit(player, targetSpace)) {
    return {
      actionType: 'gameEffect',
      effectType: 'startEngagement',
    };
  }

  // Open ground: the move can finish.
  return {
    actionType: 'gameEffect',
    effectType: 'completeUnitMovement',
  };
}
