import type { Event } from '@events';
import type { GameState, GameStateForVisibility } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState, updateRoundEventStream } from '@transforms';

import { getLegalChooseCardOptions } from './getLegalChooseCardOptions';

const chooseCardBase = {
  choiceType: 'chooseCard' as const,
  eventNumber: 0,
  eventType: 'playerChoice' as const,
};

/**
 * GetLegalChooseCardOptions: pending owned players' in-hand cards during
 * playCards / chooseCards, including player-seen visibility.
 */
describe(getLegalChooseCardOptions, () => {
  function stateChooseCardsBothPending(): GameState {
    const base = createEmptyGameState();
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
        inHand: [tempCommandCards[3], tempCommandCards[4]],
      },
    });
  }

  it('returns each in-hand card as a full ChooseCardEvent with eventNumber when both still choose', () => {
    const state = stateChooseCardsBothPending();
    const options = getLegalChooseCardOptions(state);

    expect(options).toHaveLength(3);
    for (const o of options) {
      expect(o.eventNumber).toBe(0);
    }
    expect(options.filter((o) => o.player === 'black')).toStrictEqual([
      { ...chooseCardBase, card: tempCommandCards[2], player: 'black' },
    ]);
    expect(options.filter((o) => o.player === 'white')).toStrictEqual([
      { ...chooseCardBase, card: tempCommandCards[3], player: 'white' },
      { ...chooseCardBase, card: tempCommandCards[4], player: 'white' },
    ]);
  });

  it('returns only the other player options when one has already chosen', () => {
    const withPhase = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const state = updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        awaitingPlay: tempCommandCards[0],
        inHand: [],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
    });

    const options = getLegalChooseCardOptions(state);
    expect(options).toStrictEqual([
      { ...chooseCardBase, card: tempCommandCards[2], player: 'white' },
    ]);
  });

  it('returns empty when not in playCards phase', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });
    expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
  });

  it('returns empty when playCards is not on chooseCards step', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
  });

  it('returns empty when both players already have awaitingPlay set', () => {
    const withPhase = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const state = updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        awaitingPlay: tempCommandCards[0],
        inHand: [],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: tempCommandCards[1],
        inHand: [],
      },
    });

    expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
  });

  describe('player-seen visibility', () => {
    it('whiteSeen returns only white hand options while white is still choosing', () => {
      const base = stateChooseCardsBothPending();
      const state: GameStateForVisibility<'whiteSeen'> = {
        ...base,
        cardState: {
          visibility: 'whiteSeen',
          white: {
            ...base.cardState.white,
            awaitingPlay: null,
            inHand: [tempCommandCards[3], tempCommandCards[4]],
          },
          black: {
            awaitingPlay: null,
            burnt: [],
            discarded: [],
            inHand: ['hidden', 'hidden'],
            inPlay: null,
            played: [],
          },
        },
      };

      expect(getLegalChooseCardOptions(state)).toStrictEqual([
        { ...chooseCardBase, card: tempCommandCards[3], player: 'white' },
        { ...chooseCardBase, card: tempCommandCards[4], player: 'white' },
      ]);
    });

    it('blackSeen returns only black hand options while black is still choosing', () => {
      const base = stateChooseCardsBothPending();
      const state: GameStateForVisibility<'blackSeen'> = {
        ...base,
        cardState: {
          visibility: 'blackSeen',
          black: {
            ...base.cardState.black,
            awaitingPlay: null,
            inHand: [tempCommandCards[2]],
          },
          white: {
            awaitingPlay: null,
            burnt: [],
            discarded: [],
            inHand: ['hidden'],
            inPlay: null,
            played: [],
          },
        },
      };

      expect(getLegalChooseCardOptions(state)).toStrictEqual([
        { ...chooseCardBase, card: tempCommandCards[2], player: 'black' },
      ]);
    });

    it('whiteSeen returns empty when white has already committed', () => {
      const base = stateChooseCardsBothPending();
      const state: GameStateForVisibility<'whiteSeen'> = {
        ...base,
        cardState: {
          visibility: 'whiteSeen',
          white: {
            ...base.cardState.white,
            awaitingPlay: tempCommandCards[3],
            inHand: [tempCommandCards[4]],
          },
          black: {
            awaitingPlay: null,
            burnt: [],
            discarded: [],
            inHand: ['hidden'],
            inPlay: null,
            played: [],
          },
        },
      };

      expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
    });

    it('after black commits, whiteSeen refresh stamps the next eventNumber', () => {
      const base = stateChooseCardsBothPending();
      const prior: readonly Event[] = [
        {
          card: tempCommandCards[2],
          choiceType: 'chooseCard',
          eventNumber: 0,
          eventType: 'playerChoice',
          player: 'black',
        },
      ];
      const withEvents = updateRoundEventStream(base, prior);
      const state: GameStateForVisibility<'whiteSeen'> = {
        ...withEvents,
        cardState: {
          visibility: 'whiteSeen',
          white: {
            ...withEvents.cardState.white,
            awaitingPlay: null,
            inHand: [tempCommandCards[3]],
          },
          black: {
            awaitingPlay: 'hidden',
            burnt: [],
            discarded: [],
            inHand: [],
            inPlay: null,
            played: [],
          },
        },
      };

      expect(getLegalChooseCardOptions(state)).toStrictEqual([
        {
          ...chooseCardBase,
          card: tempCommandCards[3],
          eventNumber: 1,
          player: 'white',
        },
      ]);
    });
  });
});
