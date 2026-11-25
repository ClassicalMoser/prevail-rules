import type { ValidationResult } from '@utils';
import type { ExpectedEventInfo, PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { findExpectedEvent } from '@expected';
import { isSideAsked } from '@queries';

/**
 * Validates that the player choice event is expected.
 * Assumes that the player choice event is a strictly valid PlayerChoiceEvent.
 * TODO(misleading): `validatePlayerChoice` calls this before it parses the
 * event, so nothing here can assume a valid event; it reads only the
 * choice type and the player. Settled by rewording the assumption, or by
 * parsing first.
 *
 * The first question `validatePlayerChoice` asks: is the game waiting on
 * this choice from this player? Legality is asked only after.
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
  // When the game owes a step of its own, such as comparing the two cards
  // for the initiative (§4.1.3), no player is asked anything, and a choice
  // sent then is early or late.
  if (expected.actionType !== 'playerChoice') {
    const effectOwed: ValidationResult = {
      errorReason: `Expected ${expected.actionType}, not a player choice`,
      result: false,
    };
    return effectOwed;
  }

  // Ensure that the choice is the one the expectation asks for.
  // Each decision has its own moment in the round, so a choice of another
  // kind, such as moving a commander while cards are being chosen, is
  // refused here before its contents are read.
  if (event.choiceType !== expected.choiceType) {
    const otherChoice: ValidationResult = {
      errorReason: `Expected ${expected.choiceType}, got ${event.choiceType}`,
      result: false,
    };
    return otherChoice;
  }

  // Ensure that the player source matches the expected player source
  // Most choices are asked of one side, the first player before the second
  // (§4.1.5); cards are asked of both at once until one is laid face down
  // (§4.1.1). A side not asked may not answer.
  if (!isSideAsked(expected.playerSource, event.player)) {
    const otherSide: ValidationResult = {
      errorReason: `Expected input from ${expected.playerSource}, not ${event.player}`,
      result: false,
    };
    return otherSide;
  }

  // If we get here, the player choice event is expected, though not necessarily legal.
  const expectedChoice: ValidationResult = {
    result: true,
  };
  return expectedChoice;
}
