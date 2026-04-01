import type { Board, PlayerSide, ValidationResult } from '@entities';
import type {
  ExpectedEventInfo,
  PlayerChoiceEvent,
  PlayerChoiceType,
  PlayerSource,
} from '@events';
import type { GameState } from '@game';
import { getExpectedEvent } from '@queries';

/**
 * Small helper function to compare a narrow PlayerSide to the broader PlayerSource.
 *
 * @param player - The player to check
 * @param source - The expected source
 * @returns True if the player matches the expected source, false otherwise
 */
function playerMatchesExpectedSource(
  player: PlayerSide,
  source: PlayerSource,
): boolean {
  if (source === 'bothPlayers') {
    return true;
  }
  return player === source;
}

/**
 * Validates that the player choice event is expected.
 * Assumes that the player choice event is a strictly valid PlayerChoiceEvent.
 *
 * @param event - The player choice event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the player choice event is expected
 */
export function validateExpectedChoice<
  TBoard extends Board,
  TPlayerChoiceType extends PlayerChoiceType,
>(
  event: PlayerChoiceEvent<TBoard, TPlayerChoiceType>,
  state: GameState<TBoard>,
): ValidationResult {
  try {
    // Get the expected event, and handle any errors that may occur
    let expected: ExpectedEventInfo;
    try {
      expected = getExpectedEvent(state);
    } catch (error) {
      // Queries can throw errors, so we need to handle them
      return {
        result: false,
        errorReason:
          error instanceof Error
            ? `Error resolving expected event: ${error.message}`
            : 'Unknown error resolving expected event',
      };
    }

    // Ensure that we are expecting a player choice
    if (expected.actionType !== 'playerChoice') {
      return {
        result: false,
        errorReason: `Expected ${expected.actionType}, not a player choice`,
      };
    }

    // Ensure that the choice type matches the expected choice type
    if (expected.choiceType !== event.choiceType) {
      return {
        result: false,
        errorReason: `Expected ${expected.choiceType}, got ${event.choiceType}`,
      };
    }

    // Ensure that the player source matches the expected player source
    if (!playerMatchesExpectedSource(event.player, expected.playerSource)) {
      return {
        result: false,
        errorReason: `Expected input from ${expected.playerSource}, not ${event.player}`,
      };
    }

    // If we get here, the player choice event is expected, though not necessarily legal.
    return {
      result: true,
    };
  } catch (error) {
    // Catch any errors that may occur since validations may never throw errors
    return {
      result: false,
      errorReason:
        error instanceof Error
          ? `Error validating expected choice: ${error.message}`
          : 'Unknown error validating expected choice',
    };
  }
}
