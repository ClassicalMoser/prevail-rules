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

  // Ensure that the choice type is one the expectation accepts: the choice
  // it asks for, or one it names as standing in for it (a player asked to
  // give another order may stop instead, §4.3.3).
  const acceptedChoiceTypes = [
    expected.choiceType,
    ...(expected.alsoAccepted ?? []),
  ];
  if (!acceptedChoiceTypes.includes(event.choiceType)) {
    return {
      errorReason: `Expected ${acceptedChoiceTypes.join(' or ')}, got ${event.choiceType}`,
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
