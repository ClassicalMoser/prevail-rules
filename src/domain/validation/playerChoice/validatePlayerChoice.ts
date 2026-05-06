import type { LargeBoard, SmallBoard, StandardBoard, ValidationResult } from "@entities";
import type { PlayerChoiceEvent, PlayerChoiceEventForBoard } from "@events";
import type { GameState } from "@game";
import { validateExpectedChoice } from "./validateExpectedChoice";
import {
  largePlayerChoiceEventSchema,
  smallPlayerChoiceEventSchema,
  standardPlayerChoiceEventSchema,
} from "@events";
import { validateLegalPlayerChoice } from "./validateLegalPlayerChoice";
import { ZodError } from "zod";

function handleParseFailure(error: ZodError): ValidationResult {
  return {
    result: false,
    errorReason: `Invalid player choice event: ${error.message}`,
  };
}

/**
 * Validates a player choice against the current game state.
 * Two step process:
 * 1. Ensures the choice matches what the sequencing layer expects (choice type and player source).
 * 2. Ensures the choice is legal under the rules (phase/step-specific checks via isValid* helpers).
 * @param event - The player choice event to validate (must be a PlayerChoiceEventForBoard)
 * @param state - The current game state
 * @returns ValidationResult indicating if the player choice is both expected and legal
 */
export function validatePlayerChoice(event: PlayerChoiceEvent, state: GameState): ValidationResult {
  try {
    // Step 1: Validate that the player choice is expected:
    // choice type and player source match expected event
    // Does not check that the choice is legal under the rules.
    // Also does not narrow based on board type.
    const expectedValidation = validateExpectedChoice(event, state);
    if (!expectedValidation.result) {
      // If the player choice is not expected, return the error
      return expectedValidation;
    }
    // Otherwise, the player choice is expected, whether legal or not.

    // Step 2: Validate that the player choice is legal under the rules

    // VERY IMPORTANT: Validate that the player choice event is a strictly valid PlayerChoiceEvent
    // for the specific board type.
    // This will save all possible type headaches down the line.
    const boardType = state.boardType;
    let safelyParsed;
    switch (boardType) {
      case "small": {
        safelyParsed = smallPlayerChoiceEventSchema.safeParse(event);
        if (!safelyParsed.success) {
          handleParseFailure(safelyParsed.error);
        }
        const eventForBoard = safelyParsed.data as PlayerChoiceEventForBoard<SmallBoard>;
        const legalValidation = validateLegalPlayerChoice(eventForBoard, state);
        // Return pass or fail, since this is the last validation step.
        return legalValidation;
      }
      case "standard": {
        safelyParsed = standardPlayerChoiceEventSchema.safeParse(event);
        if (!safelyParsed.success) {
          handleParseFailure(safelyParsed.error);
        }
        const eventForBoard = safelyParsed.data as PlayerChoiceEventForBoard<StandardBoard>;
        const legalValidation = validateLegalPlayerChoice(eventForBoard, state);
        // Return pass or fail, since this is the last validation step.
        return legalValidation;
      }
      case "large": {
        safelyParsed = largePlayerChoiceEventSchema.safeParse(event);
        if (!safelyParsed.success) {
          handleParseFailure(safelyParsed.error);
        }
        const eventForBoard = safelyParsed.data as PlayerChoiceEventForBoard<LargeBoard>;
        const legalValidation = validateLegalPlayerChoice(eventForBoard, state);
        // Return pass or fail, since this is the last validation step.
        return legalValidation;
      }
      default: {
        const _exhaustive: never = boardType;
        throw new Error(`Unknown board type: ${boardType}`);
      }
    }
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
