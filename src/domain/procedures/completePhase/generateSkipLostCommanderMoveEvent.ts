import type { SkipLostCommanderMoveEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
} from '@events';
import { getMoveCommandersPhaseState, getOtherPlayer } from '@queries';

/**
 * Generates a SkipLostCommanderMoveEvent on the Move Commanders turn of a
 * player whose commander has fallen (§4.2.8). The event carries nothing: whose
 * turn it is, and that their commander is lost, are the state's.
 *
 * The expected engine asks for it only on such a turn, so being asked
 * anywhere else is the caller's mistake and throws.
 *
 * @param state - The current game state
 * @returns A complete SkipLostCommanderMoveEvent
 * @throws Error off a player's turn, or when that player's commander stands
 */
export function generateSkipLostCommanderMoveEvent(
  state: GameState,
): SkipLostCommanderMoveEvent {
  // Only a player's turn can be passed over.
  const { step } = getMoveCommandersPhaseState(state);
  if (step === 'complete') {
    throw new Error('Move Commanders is complete; no turn to pass over');
  }

  // The first player's turn, then the second's (§4.2.1).
  const firstPlayer = state.currentInitiative;
  const player =
    step === 'moveFirstCommander' ? firstPlayer : getOtherPlayer(firstPlayer);

  // A player whose commander stands moves it.
  if (!state.lostCommanders.includes(player)) {
    throw new Error(
      `${player}'s commander stands, so their move is not passed over`,
    );
  }

  const event: SkipLostCommanderMoveEvent = {
    effectType: SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
