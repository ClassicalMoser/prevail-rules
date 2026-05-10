import type { StandardBoard } from '@entities';
import type { ChooseCardEvent, PlayerChoiceEventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { validatePlayerChoice } from './validatePlayerChoice';

/**
 * ValidatePlayerChoice: Validates a player choice against the current game state.
 */
describe(validatePlayerChoice, () => {
  function stateInPlayCardsChooseCards(): GameStateForBoard<StandardBoard> {
    const base = createEmptyGameState();
    const withPhase = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    return updateCardState(withPhase, (current) => ({
      ...current,
      black: {
        ...current.black,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
      white: {
        ...current.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[3]],
      },
    }));
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes when the expected choice matches and is legal', () => {
    const state = stateInPlayCardsChooseCards();
    const event: ChooseCardEvent = {
      card: tempCommandCards[2],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const validation = validatePlayerChoice(event, state);

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBeTruthy();
  });

  it('fails when a game effect is expected instead of player input', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    const event: ChooseCardEvent = {
      card: tempCommandCards[0],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const validation = validatePlayerChoice(event, state);

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBeFalsy();
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('gameEffect');
    expect(validation.errorReason).toContain('not a player choice');
  });

  it('fails when the wrong player acts for the expected source', () => {
    const state = updateCardState(
      updatePhaseState(createEmptyGameState(), {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      }),
      (current) => ({
        ...current,
        black: {
          ...current.black,
          awaitingPlay: tempCommandCards[0],
          inHand: [],
        },
        white: {
          ...current.white,
          awaitingPlay: null,
          inHand: [tempCommandCards[2]],
        },
      }),
    );

    const event: ChooseCardEvent = {
      card: tempCommandCards[0],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const validation = validatePlayerChoice(event, state);

    const expectedErrorMessage = 'Expected input from white, not black';

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBeFalsy();
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(expectedErrorMessage);
  });

  it('fails when choice type does not match the expected choice', () => {
    const state = stateInPlayCardsChooseCards();
    const event = {
      boardType: 'standard' as const,
      choiceType: 'moveCommander' as const,
      eventNumber: 0,
      eventType: 'playerChoice' as const,
      from: 'E-5' as const,
      player: 'black' as const,
      to: 'E-6' as const,
    } satisfies PlayerChoiceEventForBoard<StandardBoard>;

    const validation = validatePlayerChoice(event, state);

    expect(validation.result).toBeFalsy();
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('chooseCard');
    expect(validation.errorReason).toContain('moveCommander');
  });
});
