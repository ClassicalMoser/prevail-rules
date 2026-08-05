import type { ValidationResult } from '@entities';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { validateExpectedChoice } from './validateExpectedChoice';
import { playerChoiceEventSchema } from '@events';
import { validateLegalPlayerChoice } from './validateLegalPlayerChoice';
import type { ZodError } from 'zod';

function handleParseFailure(error: ZodError): ValidationResult {
  return {
    errorReason: `Invalid player choice event: ${error.message}`,
    result: false,
  };
}

/**
 * Validates a player choice against the current game state.
 * Two step process:
 * 1. Ensures the choice matches what the sequencing layer expects (choice type and player source).
 * 2. Ensures the choice is legal under the rules (phase/step-specific checks via isValid* helpers).
 */
export function validatePlayerChoice(
  event: PlayerChoiceEvent,
  state: GameState,
): ValidationResult {
  try {
    const expectedValidation = validateExpectedChoice(event, state);
    if (!expectedValidation.result) {
      return expectedValidation;
    }

    const safelyParsed = playerChoiceEventSchema.safeParse(event);
    if (!safelyParsed.success) {
      return handleParseFailure(safelyParsed.error);
    }

    return validateLegalPlayerChoice(safelyParsed.data, state);
  } catch (error) {
    return {
      errorReason:
        error instanceof Error
          ? `Error validating player choice: ${error.message}`
          : 'Unknown error validating player choice',
      result: false,
    };
  }
}
