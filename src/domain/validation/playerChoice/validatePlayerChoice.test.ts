import { tempCommandCards } from '@sampleValues';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createMoveCommandersPhaseState,
  createPlayableGame,
  updateCardState,
} from '@testing';

import { updatePhaseState } from '@transforms';
import { validatePlayerChoice } from './validatePlayerChoice';

import {
  createChooseCardEvent,
  createEmptyGameState,
  createMoveCommanderEvent,
} from '@factories';
/**
 * ValidatePlayerChoice: Validates a player choice against the current game state.
 */
describe('validatePlayerChoice function', () => {
  function stateInPlayCardsChooseCards(): GameState {
    const base = createEmptyGameState('standard');
    const withPhase = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    return updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[3]],
      },
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fails when a game effect is expected instead of player input', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    });
    const event = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });

    const validation = validatePlayerChoice(event, state);

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('gameEffect');
    expect(validation.errorReason).toContain('not a player choice');
  });

  it('fails when the wrong player acts for the expected source', () => {
    const withPhase = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const state = updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        // Already chose (awaitingPlay set); hand must stay non-empty so endgame
        // does not short-circuit before the wrong-player check.
        awaitingPlay: tempCommandCards[0],
        inHand: [tempCommandCards[4]],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
    });

    const event = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });

    const validation = validatePlayerChoice(event, state);

    const expectedErrorMessage = 'Expected input from white, not black';

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(expectedErrorMessage);
  });

  it('fails when choice type does not match the expected choice', () => {
    const state = stateInPlayCardsChooseCards();
    const event: PlayerChoiceEvent = createMoveCommanderEvent({
      player: 'black',
      to: 'E-6',
    });

    const validation = validatePlayerChoice(event, state);

    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('chooseCard');
    expect(validation.errorReason).toContain('moveCommander');
  });

  it('turns a fault found while checking legality into a refusal that names the cause', () => {
    // White holds the initiative, so white moves its commander first, and the
    // game is waiting on exactly that choice. But white's commander was never
    // placed, so there is no commander to move: a fault in the state, not a
    // move to weigh.
    const game = createPlayableGame(
      [
        { coord: 'A-1', facing: 'south', player: 'white' },
        { coord: 'I-9', facing: 'north', player: 'black' },
      ],
      { initiative: 'white' },
    );
    const state = updatePhaseState(game, createMoveCommandersPhaseState());
    const event = createMoveCommanderEvent({
      player: 'white',
      to: 'E-7',
    });

    const validation = validatePlayerChoice(event, state);

    expect(validation).toStrictEqual({
      errorReason:
        'Error validating player choice: The white commander is not on the board',
      result: false,
    });
  });
});
