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

import { getGameOverWinner } from './getGameOverWinner';

describe(getGameOverWinner, () => {
  it('returns undefined when the game should continue', () => {
    expect(getGameOverWinner(createEmptyGameState())).toBeUndefined();
  });

  it('prefers empty-hand result over rout discard', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    const state = updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          playerRallied: true,
          rallyResolved: true,
          routState: createRoutState('black', createTestUnit('black'), {
            cardsChosen: false,
            numberToDiscard: 99,
          }),
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    // White empty → black wins, even though black also has an unpayable rout.
    expect(getGameOverWinner(state)).toBe('black');
  });

  it('returns unpayable rout winner when hands are non-empty', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
        inPlay: null,
      },
    });
    const state = updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          playerRallied: true,
          rallyResolved: true,
          routState: createRoutState('white', createTestUnit('white'), {
            cardsChosen: false,
            numberToDiscard: 2,
          }),
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    expect(getGameOverWinner(state)).toBe('black');
  });
});
