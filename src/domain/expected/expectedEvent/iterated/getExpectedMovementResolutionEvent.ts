import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import { isPending, isResolved } from '@utils';
import { getBoardSpace, hasEnemyUnit } from '@queries';
import { getExpectedEngagementEvent } from '../composable';

/**
 * Gets the expected event for movement resolution substeps.
 *
 * One unit's part of a Move order is carried out in the order of §4.3.10: a
 * card may be committed for it, the move is written, and if the move ends on
 * an enemy an engagement begins and is set up at once (§6). The command
 * resolution sequencer asks this while a Move order's unit is under way.
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
  // TODO(composition): nothing in play sets `completed` on a move (the
  // completing effect clears the order's slot to 'pending' instead), so this
  // guard catches only a forged state. Deciding whether the substep keeps a
  // `completed` flag at all would settle both the field and the guard.
  if (resolutionState.completed) {
    throw new Error('Movement resolution state is already complete');
  }

  // Check commitment state
  // Before it moves, the moving player may commit a card for +1 Speed or
  // +1 Flexibility, or decline (§4.3.10 step 2, §8.4).
  if (resolutionState.commitment.commitmentType === 'pending') {
    // If the commitment has not been completed, that is what we expect next
    const commitToMovement: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: player,
    };
    return commitToMovement;
  }

  // With the card committed or declined, the move itself is written next
  // (§4.3.10): the commitment counts toward it, so it must come first.
  if (isPending(resolutionState.targetPlacement)) {
    const moveUnit: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'moveUnit',
      playerSource: player,
    };
    return moveUnit;
  }

  // The move has been written.
  // An engagement already under way decides what comes next, whatever the
  // board now shows: a rear engagement routs its defender off the board the
  // moment it starts, yet its owner still owes the Morale (§6.3.3). Asking
  // the board first would see an empty space and end the move unpaid.
  const { engagementState } = resolutionState;
  if (isResolved(engagementState)) {
    // Once the engagement is settled, the move can finish.
    if (engagementState.completed) {
      const completeAfterEngagement: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'completeUnitMovement',
      };
      return completeAfterEngagement;
    }

    // Otherwise the engagement's own order says what is owed: a front
    // defender's commitment and retreat, a flank defender's turn, a rear
    // defender's rout (§6.3). The moving unit's side is the engaging side.
    // TODO(composition): the engaging side is read from the moving unit here
    // but taken from `player` everywhere else in this function; both name the
    // player carrying out the order. Reading one of them throughout would settle it.
    const engagementEvent = getExpectedEngagementEvent(
      engagementState,
      resolutionState.movingUnit.playerSide,
    );
    return engagementEvent;
  }

  // No engagement yet: a move that ends on an enemy starts one (§6.1).
  const targetSpace = getBoardSpace(
    gameState.boardState,
    resolutionState.targetPlacement.coordinate,
  );
  if (hasEnemyUnit(player, targetSpace)) {
    const startEngagement: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'startEngagement',
    };
    return startEngagement;
  }

  // Open ground: the move can finish.
  const completeUnitMovement: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'completeUnitMovement',
  };
  return completeUnitMovement;
}
