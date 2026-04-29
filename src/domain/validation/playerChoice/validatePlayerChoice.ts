import type { Board, ValidationResult } from "@entities";
import type { PlayerChoiceEvent, PlayerChoiceType } from "@events";
import type { GameStateWithBoard } from "@game";
import { playerChoiceEventSchema } from "@events";
import { validateExpectedChoice } from "./validateExpectedChoice";
import { validateLegalPlayerChoice } from "./validateLegalPlayerChoice";

/**
 * Validates a player choice against the current game state.
 * Two step process:
 * 1. Ensures the choice matches what the sequencing layer expects (choice type and player source).
 * 2. Ensures the choice is legal under the rules (phase/step-specific checks via isValid* helpers).
 * @param event - The player choice event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the player choice is both expected and legal
 */
export function validatePlayerChoice<TBoard extends Board>(
  event: PlayerChoiceEvent<TBoard, PlayerChoiceType>,
  state: GameStateWithBoard<TBoard>,
): ValidationResult {
  // Step 1: Validate that the player choice matches the expected event
  try {
    // VERY IMPORTANT: Validate that the player choice event is a strictly valid PlayerChoiceEvent
    // This will save all possible type headaches down the line
    const safelyParsed = playerChoiceEventSchema.safeParse(event);
    if (!safelyParsed.success) {
      console.error(safelyParsed.error);
      return {
        result: false,
        errorReason: `Invalid player choice event: ${safelyParsed.error.message}`,
      };
    }

    // Step 1: Validate that the player choice is expected
    const expectedValidation = validateExpectedChoice(event, state);
    if (!expectedValidation.result) {
      // If the player choice is not expected, return the error
      return expectedValidation;
    }
    // Otherwise, the player choice is expected, whether legal or not.

    // Step 2: Validate that the player choice is legal under the rules
    const legalValidation = validateLegalPlayerChoice(event, state);
    // Whether it is legal or not, we return the validation result,
    // since this is the last validation step.
    return legalValidation;
  } catch (error) {
    // Catch any errors that may occur since validations may never throw
    return {
      result: false,
      errorReason:
        error instanceof Error
          ? `Error validating player choice: ${error.message}`
          : "Unknown error validating player choice",
    };
  }
}
