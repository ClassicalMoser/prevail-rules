import type { ValidationResult } from '@utils';
import { failFromFault } from '@utils';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { validateExpectedChoice } from './validateExpectedChoice';
import { playerChoiceEventSchema } from '@events';
import { validateLegalPlayerChoice } from './validateLegalPlayerChoice';
import type { ZodError } from 'zod';

/**
 * The refusal for a choice that does not parse: a client sent a shape no
 * choice can take, such as a card whose initiative is outside 1 to 4.
 *
 * @param error - The schema's account of what is malformed
 * @returns A refusal carrying that account
 */
function handleParseFailure(error: ZodError): ValidationResult {
  // The schema's message names the path to each bad field and the bound it
  // broke, so the sender can see what to fix.
  const malformed: ValidationResult = {
    errorReason: `Invalid player choice event: ${error.message}`,
    result: false,
  };
  return malformed;
}

/**
 * Validates a player choice against the current game state.
 * Two step process:
 * 1. Ensures the choice matches what the sequencing layer expects (choice type and player source).
 * 2. Ensures the choice is legal under the rules (phase/step-specific checks via isValid* helpers).
 *
 * TODO(misleading): "Two step process" lists two steps, but the body takes
 * three: expected, then a schema parse, then legal. Settled by the author
 * deciding whether the parse counts as a step of its own.
 *
 * Called by the application for each choice a player sends
 * (`processPlayerChoice`), where a refusal means the choice is not applied,
 * and by the bot harness (`playBotGame`), where a refusal is a fault in the
 * rules, since a bot chooses only from what it was offered.
 */
export function validatePlayerChoice(
  event: PlayerChoiceEvent,
  state: GameState,
): ValidationResult {
  try {
    // First, whether the game is waiting on this choice at all: the kind of
    // choice it asks for, from the side it asks. A choice out of turn is
    // refused before anything in it is read, since its contents could only
    // be judged in a moment the game is not in.
    const expectedValidation = validateExpectedChoice(event, state);
    if (!expectedValidation.result) {
      // The refusal says what was expected instead.
      return expectedValidation;
    }

    // Then, whether the choice has a shape any choice can take. A client is
    // outside the engine and its event is only typed by its word; the parse
    // is what lets the legality check read a well-formed payload.
    const safelyParsed = playerChoiceEventSchema.safeParse(event);
    if (!safelyParsed.success) {
      // A malformed choice is refused with the schema's account of it.
      const malformed = handleParseFailure(safelyParsed.error);
      return malformed;
    }

    // Last, whether the rules allow it: the parsed choice is judged by the
    // rule for that kind of choice, by membership against what the rules
    // offer in this state.
    const legality = validateLegalPlayerChoice(safelyParsed.data, state);
    // Accepted, or refused with the reason that rule gives.
    return legality;
  } catch (error) {
    // The one place a fault becomes a refusal: everything beneath it throws
    // at the site that found the fault, and is not caught on the way up.
    const fault = failFromFault(error, 'validating player choice');
    // The caller gets a refusal naming the fault, never a throw.
    return fault;
  }
}
