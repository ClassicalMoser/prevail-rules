import type {
  Board,
  ExpectedEventInfo,
  GameState,
  PlayerSide,
  PlayerSource,
  ValidationResult,
} from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import { getExpectedEvent } from '@queries';
import { isValidChooseCardEvent } from './isValidChooseCardEvent';
import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';
import { isValidChooseRoutDiscardEvent } from './isValidChooseRoutDiscardEvent';
import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';

function formatExpectedEventLabel<TBoard extends Board>(
  expected: ExpectedEventInfo<TBoard>,
): string {
  return expected.actionType === 'playerChoice'
    ? `${expected.choiceType} player choice`
    : `${expected.effectType} game effect`;
}

function formatPlayerSource(source: PlayerSource): string {
  switch (source) {
    case 'bothPlayers':
      return 'either player (both may act)';
    case 'black':
      return 'black';
    case 'white':
      return 'white';
  }
}

function playerMatchesExpectedSource(
  player: PlayerSide,
  source: PlayerSource,
): boolean {
  if (source === 'bothPlayers') {
    return true;
  }
  return player === source;
}

function validateLegalPlayerChoice<TBoard extends Board>(
  event: PlayerChoiceEvent<TBoard, PlayerChoiceType>,
  state: GameState<TBoard>,
): ValidationResult {
  switch (event.choiceType) {
    case 'chooseCard':
      return isValidChooseCardEvent(event, state);
    case 'moveCommander':
      return isValidMoveCommanderEvent(event, state);
    case 'chooseRally':
      return isValidChooseRallyEvent(event, state);
    case 'chooseRoutDiscard':
      return isValidChooseRoutDiscardEvent(event, state);
    default:
      return {
        result: false,
        errorReason: `Legal validation not implemented for ${event.choiceType}`,
      };
  }
}

/**
 * Validates a player choice against the current game state.
 *
 * 1. Ensures the choice matches what the sequencing layer expects (choice type and player source).
 * 2. Ensures the choice is legal under the rules (phase/step-specific checks via isValid* helpers).
 */
export function validatePlayerChoice<TBoard extends Board>(
  event: PlayerChoiceEvent<TBoard, PlayerChoiceType>,
  state: GameState<TBoard>,
): ValidationResult {
  try {
    if (!state.currentRoundState) {
      return {
        result: false,
        errorReason: 'No round state found',
      };
    }
    if (!state.currentRoundState.currentPhaseState) {
      return {
        result: false,
        errorReason: 'No current phase state found',
      };
    }

    let expected: ExpectedEventInfo<TBoard>;
    try {
      expected = getExpectedEvent(state);
    } catch (e) {
      return {
        result: false,
        errorReason:
          e instanceof Error
            ? e.message
            : 'Unknown error resolving expected event',
      };
    }

    if (expected.actionType !== 'playerChoice') {
      return {
        result: false,
        errorReason: `Expected ${formatExpectedEventLabel(expected)}, not a player choice`,
      };
    }

    if (expected.choiceType !== event.choiceType) {
      return {
        result: false,
        errorReason: `Expected ${expected.choiceType} player choice, got ${event.choiceType}`,
      };
    }

    if (!playerMatchesExpectedSource(event.player, expected.playerSource)) {
      return {
        result: false,
        errorReason: `Expected input from ${formatPlayerSource(expected.playerSource)}, not ${event.player}`,
      };
    }

    return validateLegalPlayerChoice(event, state);
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
