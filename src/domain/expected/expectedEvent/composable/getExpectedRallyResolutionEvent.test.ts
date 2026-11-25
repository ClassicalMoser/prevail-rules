import {
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';

import { getExpectedRallyResolutionEvent } from './getExpectedRallyResolutionEvent';

/**
 * GetExpectedRallyResolutionEvent: next rally-resolution step as choice or effect from rally state.
 */
describe('getExpectedRallyResolutionEvent function', () => {
  // Black's unit, the one left without a place at the support check where a
  // case needs one.
  const uncovered = createTestUnit('black');

  it('a rally first waits on the engine to burn a card and return the rest', () => {
    // White chose to rally; nothing is burnt yet.
    const rallyState = createRallyResolutionState({ playerRallied: true });

    // The burnt card is drawn at random, so the engine draws it (§10.3.2).
    expect(getExpectedRallyResolutionEvent(rallyState, 'white')).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRally',
    });
  });

  it('with the cards back in hand, the rallying player assigns unit support', () => {
    // White's cards are back in hand, and no unit has a place yet.
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
    });

    // The rallying player fills the places their cards hold (§10.4.4).
    expect(getExpectedRallyResolutionEvent(rallyState, 'white')).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'assignUnitSupport',
      playerSource: 'white',
    });
  });

  it('units left without a place rout, and their owner pays for them', () => {
    // Black's support check left one unit uncovered, and its rout is open.
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('black', uncovered),
      unitsLostSupport: [uncovered],
    });

    // The open rout's own next step: its Morale counted first (§10.4.7).
    expect(getExpectedRallyResolutionEvent(rallyState, 'black')).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it.each(['pending', 'bypassed'] as const)(
    'throws when units lost support but the rout reads %s, since the support check opens it',
    (routState) => {
      // A unit was left uncovered, yet no rout was opened for it.
      const rallyState = createRallyResolutionState({
        playerRallied: true,
        rallyResolved: true,
        routState,
        unitsLostSupport: [uncovered],
      });

      expect(() =>
        getExpectedRallyResolutionEvent(rallyState, 'black'),
      ).toThrow('Rout state is required when units lost support');
    },
  );

  it('throws when every unit kept its place but cleanup has not moved on', () => {
    // Nothing routs, so the support check should already have moved cleanup on.
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: 'bypassed',
      unitsLostSupport: [],
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState, 'white')).toThrow(
      'Rally resolution complete but step not advanced',
    );
  });

  it('throws when the routs are paid for but cleanup has not moved on', () => {
    // The uncovered unit's rout is paid, which closes the rally.
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('black', uncovered, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
      unitsLostSupport: [uncovered],
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState, 'black')).toThrow(
      'Rally resolution complete but step not advanced',
    );
  });

  it('a finished rally has nothing left to ask for, so asking throws', () => {
    // White's rally is over.
    const rallyState = createRallyResolutionState({
      completed: true,
      playerRallied: true,
      rallyResolved: true,
      routState: 'bypassed',
      unitsLostSupport: [],
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState, 'white')).toThrow(
      'Rally resolution state is already complete',
    );
  });
});
