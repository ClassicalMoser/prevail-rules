import type { PlayerSide } from '@entities';
import type { ValidationResult } from '@utils';
import type {
  ExpectedEventInfo,
  PlayerChoiceEvent,
  PlayerSource,
} from '@events';
import type { GameState } from '@game';
import { findExpectedEvent } from '@expected';
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

  // Ensure that the choice type matches the expected choice type.
  // While issuing, `doneIssuingCommands` is always an accepted alternative to
  // `issueCommand` (forfeit leftover slots).
  const choiceTypeMatches =
    expected.choiceType === event.choiceType ||
    (expected.choiceType === 'issueCommand' &&
      event.choiceType === 'doneIssuingCommands');
  if (!choiceTypeMatches) {
    return {
      errorReason: `Expected ${expected.choiceType}, got ${event.choiceType}`,
      result: false,
    };
  }

  // Ensure that the player source matches the expected player source
  if (!playerMatchesExpectedSource(event.player, expected.playerSource)) {
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
