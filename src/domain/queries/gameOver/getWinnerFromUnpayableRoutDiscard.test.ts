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

import { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

describe(getWinnerFromUnpayableRoutDiscard, () => {
  function stateAwaitingDiscard(options: {
    player: 'white' | 'black';
    numberToDiscard: number;
    handCardIndexes: readonly number[];
  }) {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const hand = options.handCardIndexes.map((i) => tempCommandCards[i]);
    const withCards = updateCardState(base, {
      ...base.cardState,
      [options.player]: {
        ...base.cardState[options.player],
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
      // Keep the other hand non-empty so empty-hand endgame stays out of scope.
      [options.player === 'white' ? 'black' : 'white']: {
        ...base.cardState[options.player === 'white' ? 'black' : 'white'],
        inHand: [tempCommandCards[5]],
      },
    });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState(
        options.player,
        createTestUnit(options.player),
        {
          cardsChosen: false,
          numberToDiscard: options.numberToDiscard,
        },
      ),
    });
    return updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rallyState,
        step: 'firstPlayerResolveRally',
      }),
    );
  }

  it('returns undefined when discard is payable (strictly less than hand size)', () => {
    const state = stateAwaitingDiscard({
      handCardIndexes: [2, 3, 4],
      numberToDiscard: 2,
      player: 'white',
    });

    expect(getWinnerFromUnpayableRoutDiscard(state)).toBeUndefined();
  });

  it('returns black when white must discard equal to hand size', () => {
    const state = stateAwaitingDiscard({
      handCardIndexes: [2, 3],
      numberToDiscard: 2,
      player: 'white',
    });

    expect(getWinnerFromUnpayableRoutDiscard(state)).toBe('black');
  });

  it('returns white when black must discard more than hand size', () => {
    const state = stateAwaitingDiscard({
      handCardIndexes: [2],
      numberToDiscard: 3,
      player: 'black',
    });

    expect(getWinnerFromUnpayableRoutDiscard(state)).toBe('white');
  });

  it('returns undefined when no rout discard is awaiting', () => {
    expect(
      getWinnerFromUnpayableRoutDiscard(createEmptyGameState()),
    ).toBeUndefined();
  });
});
