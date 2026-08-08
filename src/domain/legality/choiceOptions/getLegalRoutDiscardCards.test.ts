import type { GameStateForVisibility } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalRoutDiscardCards } from './getLegalRoutDiscardCards';

/**
 * GetLegalRoutDiscardCards: atomic eligible hand card IDs + required count when
 * cleanup resolveRally awaits a rout discard.
 */
describe(getLegalRoutDiscardCards, () => {
  function stateAwaitingDiscard(options: {
    step: 'firstPlayerResolveRally' | 'secondPlayerResolveRally';
    player: 'white' | 'black';
    numberToDiscard: number;
    handCardIndexes?: readonly number[];
    cardsChosen?: boolean;
    initiative?: 'white' | 'black';
  }): GameStateForVisibility<'authoritative'> {
    const initiative = options.initiative ?? 'white';
    const base = createEmptyGameState({ currentInitiative: initiative });
    const unit = createTestUnit(options.player);
    const handIndexes = options.handCardIndexes ?? [2, 3, 4];
    const hand = handIndexes.map((i) => tempCommandCards[i]);
    const withCards = updateCardState(base, {
      ...base.cardState,
      [options.player]: {
        ...base.cardState[options.player],
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
    });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState(options.player, unit, {
        cardsChosen: options.cardsChosen ?? false,
        numberToDiscard: options.numberToDiscard,
      }),
    });
    return updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState:
          options.step === 'firstPlayerResolveRally' ? rallyState : 'pending',
        secondPlayerRallyResolutionState:
          options.step === 'secondPlayerResolveRally' ? rallyState : 'pending',
        step: options.step,
      }),
    );
  }

  it('returns eligible hand card IDs and the required discard count', () => {
    const state = stateAwaitingDiscard({
      numberToDiscard: 2,
      player: 'white',
      step: 'firstPlayerResolveRally',
    });

    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [
        tempCommandCards[2].id,
        tempCommandCards[3].id,
        tempCommandCards[4].id,
      ],
      numberToDiscard: 2,
      player: 'white',
    });
  });

  it('returns an empty card ID list when numberToDiscard is 0 but still reports the count', () => {
    const state = stateAwaitingDiscard({
      numberToDiscard: 0,
      player: 'white',
      step: 'firstPlayerResolveRally',
    });

    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [
        tempCommandCards[2].id,
        tempCommandCards[3].id,
        tempCommandCards[4].id,
      ],
      numberToDiscard: 0,
      player: 'white',
    });
  });

  it('returns null when not in cleanup resolveRally', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalRoutDiscardCards(state)).toBeNull();
  });

  it('returns null when cards are already chosen', () => {
    const state = stateAwaitingDiscard({
      cardsChosen: true,
      numberToDiscard: 1,
      player: 'white',
      step: 'firstPlayerResolveRally',
    });
    expect(getLegalRoutDiscardCards(state)).toBeNull();
  });

  it('still returns available cards when the hand is smaller than numberToDiscard', () => {
    const state = stateAwaitingDiscard({
      handCardIndexes: [2],
      numberToDiscard: 2,
      player: 'white',
      step: 'firstPlayerResolveRally',
    });
    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [tempCommandCards[2].id],
      numberToDiscard: 2,
      player: 'white',
    });
  });

  it('whiteSeen returns white hand atoms when white must discard', () => {
    const authoritative = stateAwaitingDiscard({
      numberToDiscard: 1,
      player: 'white',
      step: 'firstPlayerResolveRally',
    });
    const whiteSeen: GameStateForVisibility<'whiteSeen'> = {
      ...authoritative,
      cardState: {
        visibility: 'whiteSeen',
        white: {
          ...authoritative.cardState.white,
          awaitingPlay: null,
          inHand: [tempCommandCards[2], tempCommandCards[3]],
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

    expect(getLegalRoutDiscardCards(whiteSeen)).toStrictEqual({
      cardIds: [tempCommandCards[2].id, tempCommandCards[3].id],
      numberToDiscard: 1,
      player: 'white',
    });
  });

  it('whiteSeen returns null when black must discard', () => {
    const authoritative = stateAwaitingDiscard({
      initiative: 'white',
      numberToDiscard: 1,
      player: 'black',
      step: 'secondPlayerResolveRally',
    });
    const whiteSeen: GameStateForVisibility<'whiteSeen'> = {
      ...authoritative,
      cardState: {
        visibility: 'whiteSeen',
        white: authoritative.cardState.white,
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

    expect(getLegalRoutDiscardCards(whiteSeen)).toBeNull();
  });
});
