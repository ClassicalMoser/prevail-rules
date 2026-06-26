import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalChooseCardOptions } from './getLegalChooseCardOptions';

const chooseCardBase = {
  choiceType: 'chooseCard' as const,
  eventNumber: 0,
  eventType: 'playerChoice' as const,
};

/**
 * GetLegalChooseCardOptions: pending players' in-hand cards during playCards / chooseCards.
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

  it('throws when not in playCards phase', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });
    expect(() => getLegalChooseCardOptions(state)).toThrow(
      'Expected playCards phase, got moveCommanders',
    );
  });

  it('throws when playCards is not on chooseCards step', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    expect(() => getLegalChooseCardOptions(state)).toThrow(
      'Not in choose cards step',
    );
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
});
