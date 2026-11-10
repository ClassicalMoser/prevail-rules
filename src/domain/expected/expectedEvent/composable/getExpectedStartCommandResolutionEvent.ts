import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';

/**
 * Gets the expected event to start resolving a command for a unit.
 * Determines what action is needed based on the active card's command type.
 *
 * @param state - The current game state
 * @param player - The player whose units need to be resolved
 * @returns Information about what event is expected
 */
export function getExpectedStartCommandResolutionEvent(
  state: GameState,
  player: PlayerSide,
): ExpectedEventInfo {
  const activeCard = state.cardState[player].inPlay;
  if (!activeCard) {
    throw new Error(`${player} player has no active card`);
  }
  // Command type determines what action is expected to start resolution
  if (activeCard.command.type === 'movement') {
    // A Move order is carried out one unit at a time, starting by naming
    // the unit; its commitment and its move follow (§4.3.10).
    return {
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: player,
    };
  } else if (activeCard.command.type === 'rangedAttack') {
    // A Shoot order is carried out one shot at a time, starting by naming
    // the shooter; its commitment and its target follow (§4.3.11).
    return {
      actionType: 'playerChoice',
      choiceType: 'chooseShooter',
      playerSource: player,
    };
  }
  throw new Error(`Invalid command type: ${activeCard.command.type as string}`);
}
