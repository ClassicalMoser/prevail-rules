import type { StandardBoard } from '@entities';
import type {
  ChooseCardEvent,
  IssueCommandEvent,
  PlayerChoiceEvent,
} from '@events';
import type { StandardGameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import * as expectedEventQueries from '@queries';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validatePlayerChoice } from './validatePlayerChoice';

/**
 * validatePlayerChoice: Validates a player choice against the current game state.
 */
describe('validatePlayerChoice', () => {
  function stateInPlayCardsChooseCards(): StandardGameState {
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
    const event: ChooseCardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseCard',
      eventNumber: 0,
      player: 'black',
      card: tempCommandCards[2],
    };

    const validation = validatePlayerChoice(event, state);

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBe(true);
  });

  it('fails when a game effect is expected instead of player input', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    const event: ChooseCardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseCard',
      eventNumber: 0,
      player: 'black',
      card: tempCommandCards[0],
    };

    const validation = validatePlayerChoice(event, state);

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBe(false);
    if (validation.result !== false) throw new Error('expected fail');
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

    const event: ChooseCardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseCard',
      eventNumber: 0,
      player: 'black',
      card: tempCommandCards[0],
    };

    const validation = validatePlayerChoice(event, state);

    const expectedErrorMessage = 'Expected input from white, not black';

    // eslint-disable-next-line no-console
    console.log(validation);

    expect(validation.result).toBe(false);
    if (validation.result !== false) throw new Error('expected fail');
    expect(validation.errorReason).toMatch(expectedErrorMessage);
  });

  it('fails when choice type does not match the expected choice', () => {
    const state = stateInPlayCardsChooseCards();
    const event = {
      eventType: 'playerChoice' as const,
      choiceType: 'moveCommander' as const,
      boardType: 'standard' as const,
      eventNumber: 0,
      player: 'black' as const,
      from: 'E-5' as const,
      to: 'E-6' as const,
    } satisfies PlayerChoiceEvent<StandardBoard, 'moveCommander'>;

    const validation = validatePlayerChoice(event, state);

    expect(validation.result).toBe(false);
    if (validation.result !== false) throw new Error('expected fail');
    expect(validation.errorReason).toContain('chooseCard');
    expect(validation.errorReason).toContain('moveCommander');
  });

  describe('when legal validation is not implemented for the choice type', () => {
    beforeEach(() => {
      vi.spyOn(expectedEventQueries, 'getExpectedEvent').mockReturnValue({
        actionType: 'playerChoice',
        playerSource: 'black',
        choiceType: 'issueCommand',
        eventNumber: 0,
      });
    });

    it('returns a not-implemented error', () => {
      const state = stateInPlayCardsChooseCards();
      const event: IssueCommandEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'issueCommand',
        eventNumber: 0,
        player: 'black',
        command: tempCommandCards[0].command,
        units: new Set(),
      };

      const validation = validatePlayerChoice(event, state);

      // eslint-disable-next-line no-console
      console.log(validation);

      expect(validation.result).toBe(false);
      if (validation.result !== false) throw new Error('expected fail');
      expect(validation.errorReason).toContain('not implemented');
      expect(validation.errorReason).toContain('issueCommand');
    });
  });
});
