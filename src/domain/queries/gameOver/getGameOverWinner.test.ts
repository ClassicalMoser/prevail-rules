import { tempCommandCards } from '@sampleValues';
import {
  createCleanupPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getGameOverWinner } from './getGameOverWinner';

import { createEmptyGameState } from '@factories';
describe(getGameOverWinner, () => {
  it('returns undefined when the game should continue', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
      white: {
        ...base.cardState.white,
        inHand: [createTestCard({ id: 'white-hand' })],
      },
    });
    expect(getGameOverWinner(state)).toBeUndefined();
  });

  it('prefers empty-hand result over rout discard', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
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
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
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
