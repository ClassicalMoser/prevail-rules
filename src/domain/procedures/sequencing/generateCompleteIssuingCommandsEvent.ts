import type { CompleteIssuingCommandsEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import {
  getCommandingPlayer,
  getIssueCommandsPhaseState,
  getRemainingCommandsForPlayer,
} from '@queries';

/**
 * Generates a CompleteIssuingCommandsEvent once the issuing player has no
 * order left to issue (§4.3.3). The event carries nothing: the player and
 * the orders given are the state's.
 *
 * The expected engine asks for it only on an issuing step with no orders
 * left, so being asked anywhere else is the caller's mistake and throws.
 *
 * @param state - The current game state
 * @returns A complete CompleteIssuingCommandsEvent
 * @throws Error off an issuing step, or while the player has orders left
 */
export function generateCompleteIssuingCommandsEvent(
  state: GameState,
): CompleteIssuingCommandsEvent {
  // Issuing completes only on a player's issuing step.
  const { step } = getIssueCommandsPhaseState(state);
  if (
    step !== 'firstPlayerIssueCommands' &&
    step !== 'secondPlayerIssueCommands'
  ) {
    throw new Error(`Not on an issuing step: ${step}`);
  }

  // A player with orders left is still issuing.
  const player = getCommandingPlayer(state);
  if (getRemainingCommandsForPlayer(state, player).length > 0) {
    throw new Error(`${player} still has orders left to issue`);
  }

  const event: CompleteIssuingCommandsEvent = {
    effectType: COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
