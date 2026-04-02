import type { StandardBoard } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getLegalPlayCardOptions } from './getLegalPlayCardOptions';

const chooseCardBase = {
  eventNumber: 0,
  eventType: 'playerChoice' as const,
  choiceType: 'chooseCard' as const,
};

/**
 * getLegalPlayCardOptions: pending players' in-hand cards during playCards / chooseCards.
 */
describe('getLegalPlayCardOptions', () => {
  function stateChooseCardsBothPending(): StandardGameState {
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
        inHand: [tempCommandCards[3], tempCommandCards[4]],
      },
    }));
  }

  it('returns each in-hand card as a full ChooseCardEvent with eventNumber when both still choose', () => {
    const state = stateChooseCardsBothPending();
    const options = getLegalPlayCardOptions(state);

    expect(options).toHaveLength(3);
    for (const o of options) {
      expect(o.eventNumber).toBe(0);
    }
    expect(options.filter((o) => o.player === 'black')).toEqual([
      { ...chooseCardBase, player: 'black', card: tempCommandCards[2] },
    ]);
    expect(options.filter((o) => o.player === 'white')).toEqual([
      { ...chooseCardBase, player: 'white', card: tempCommandCards[3] },
      { ...chooseCardBase, player: 'white', card: tempCommandCards[4] },
    ]);
  });

  it('returns only the other player options when one has already chosen', () => {
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

    const options = getLegalPlayCardOptions(state);
    expect(options).toEqual([
      { ...chooseCardBase, player: 'white', card: tempCommandCards[2] },
    ]);
  });

  it('throws when not in playCards phase', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });
    expect(() => getLegalPlayCardOptions(state)).toThrow(
      'Expected playCards phase, got moveCommanders',
    );
  });

  it('throws when playCards is not on chooseCards step', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    expect(() => getLegalPlayCardOptions(state)).toThrow(
      'Not in choose cards step',
    );
  });

  it('returns empty when both players already have awaitingPlay set', () => {
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
          awaitingPlay: tempCommandCards[1],
          inHand: [],
        },
      }),
    );

    expect(getLegalPlayCardOptions(state)).toEqual([]);
  });
});
