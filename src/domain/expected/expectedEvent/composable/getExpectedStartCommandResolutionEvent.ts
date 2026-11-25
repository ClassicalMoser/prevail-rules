import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getCardInPlay } from '@queries';

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
  // The order being carried out is the command on the card this player has
  // in play this round (§4.3.1). The Issue Commands sequencer asks only on
  // the player's resolve step, with orders left and someone able to act, so
  // a card is in play; with none, `getCardInPlay` throws.
  const activeCard = getCardInPlay(state.cardState, player);
  // Command type determines what action is expected to start resolution
  if (activeCard.command.type === 'movement') {
    // A Move order is carried out one unit at a time, starting by naming
    // the unit; its commitment and its move follow (§4.3.10).
    const chooseMover: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: player,
    };
    return chooseMover;
  } else if (activeCard.command.type === 'rangedAttack') {
    // A Shoot order is carried out one shot at a time, starting by naming
    // the shooter; its commitment and its target follow (§4.3.11).
    const chooseShooter: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'chooseShooter',
      playerSource: player,
    };
    return chooseShooter;
  }
  // A command is a Move or a Shoot (§4.3.1); any other type is a forged card,
  // refused by name.
  throw new Error(`Invalid command type: ${activeCard.command.type}`);
}
