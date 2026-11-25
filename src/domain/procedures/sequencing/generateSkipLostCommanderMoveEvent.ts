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
  // Outside Move Commanders the getter throws; once both turns are taken the
  // phase only waits to end, and there is no turn left to pass.
  const { step } = getMoveCommandersPhaseState(state);
  if (step === 'complete') {
    throw new Error('Move Commanders is complete; no turn to pass over');
  }

  // The first player's turn, then the second's (§4.2.1).
  // The first player is whoever took the initiative in Phase 1 (§4.1.5).
  // TODO(composition): whose turn a step is, and the read of
  // `lostCommanders` below, repeat `getExpectedMoveCommandersPhaseEvent`,
  // whose mark names this function. Settle with the `@queries` readers that
  // mark proposes, asked by both.
  const firstPlayer = state.currentInitiative;
  const player =
    step === 'moveFirstCommander' ? firstPlayer : getOtherPlayer(firstPlayer);

  // A player whose commander stands moves it.
  // Only a commander defeated with its own unit's rout is lost (§4.2.8); one
  // that stands may move, or stay where it is (§4.2.6), and that is the
  // player's choice, not this effect.
  if (!state.lostCommanders.includes(player)) {
    throw new Error(
      `${player}'s commander stands, so their move is not passed over`,
    );
  }

  // The fallen commander's player has nothing to move, so the turn passes.
  // Whose turn it was is the step's to say, so nothing is recorded.
  const event: SkipLostCommanderMoveEvent = {
    effectType: SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The turn passed over, for the transform to move to the next step.
  return event;
}
