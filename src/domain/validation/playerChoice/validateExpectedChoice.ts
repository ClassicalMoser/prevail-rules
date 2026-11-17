import type { ValidationResult } from '@utils';
import type { ExpectedEventInfo, PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { findExpectedEvent } from '@expected';
import { isSideAsked } from '@queries';
/**
 * Validates that the player choice event is expected.
 * Assumes that the player choice event is a strictly valid PlayerChoiceEvent.
 *
 * @param event - The player choice event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the player choice event is expected
 */
export function validateExpectedChoice(
  event: PlayerChoiceEvent,
  state: GameState,
): ValidationResult {
  // A finished game expects nothing, so a choice sent after the battle is
  // over is refused for that reason. That is a fact about the game, not a
  // fault in it.
  const expected: ExpectedEventInfo | undefined = findExpectedEvent(state);
  if (expected === undefined) {
    const over: ValidationResult = {
      errorReason: 'The game is over, so no choice is expected',
      result: false,
    };
    return over;
  }

  // Ensure that we are expecting a player choice
  if (expected.actionType !== 'playerChoice') {
    return {
      errorReason: `Expected ${expected.actionType}, not a player choice`,
      result: false,
    };
  }

  // Ensure that the choice is the one the expectation asks for.
  if (event.choiceType !== expected.choiceType) {
    return {
      errorReason: `Expected ${expected.choiceType}, got ${event.choiceType}`,
      result: false,
    };
  }

  // Ensure that the player source matches the expected player source
  if (!isSideAsked(expected.playerSource, event.player)) {
    return {
      errorReason: `Expected input from ${expected.playerSource}, not ${event.player}`,
      result: false,
    };
  }

  // If we get here, the player choice event is expected, though not necessarily legal.
  return {
    result: true,
  };
}
