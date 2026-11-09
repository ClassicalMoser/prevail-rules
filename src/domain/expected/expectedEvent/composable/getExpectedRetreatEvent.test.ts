import {
  createRetreatState,
  createRoutState,
  createUnitWithPlacement,
} from '@testing';

import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';

/**
 * GetExpectedRetreatEvent: next retreat-resolution event from retreat substate.
 */
describe('getExpectedRetreatEvent function', () => {
  const unitPlacement = createUnitWithPlacement();

  it('given trigger rout when there are no legal retreat options and no rout state', () => {
    const retreatState = createRetreatState(unitPlacement, {
      chosenRetreatPath: 'pending' as const,
      legalRetreatPaths: [],
      routState: 'pending' as const,
    });

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'triggerRoutFromRetreat',
    });
  });

  it('given delegate to rout when retreat has no options and rout is not complete', () => {
    const retreatState = createRetreatState(unitPlacement, {
      chosenRetreatPath: 'pending' as const,
      legalRetreatPaths: [],
      routState: createRoutState('black', unitPlacement.unit, {
        cardsChosen: false,
      }),
    });

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given multiple options exist, asks the player to choose a retreat option', () => {
    const retreatState = createRetreatState(unitPlacement, {
      chosenRetreatPath: 'pending' as const,
      // Two tied ways back, so the player has a real choice to make.
      legalRetreatPaths: [
        ['turnLeft', 'step'],
        ['turnRight', 'step'],
      ],
    });

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      playerSource: 'black',
    });
  });

  it('given the retreat is already chosen, returns resolveRetreat', () => {
    const retreatState = createRetreatState(unitPlacement, {
      chosenRetreatPath: ['step'],
      legalRetreatPaths: [['step']],
    });

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRetreat',
    });
  });

  it('given when the retreat is already complete, throws', () => {
    const retreatState = createRetreatState(unitPlacement, {
      completed: true,
      chosenRetreatPath: ['step'],
      legalRetreatPaths: [['step']],
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state is already complete',
    );
  });

  it('given when rout is complete but retreat is not marked complete, throws', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatPaths: [],
      routState: createRoutState('black', unitPlacement.unit, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state has completed rout but not marked as completed',
    );
  });

  it('a single retreat option left unchosen when the retreat opens throws', () => {
    const retreatState = createRetreatState(unitPlacement, {
      chosenRetreatPath: 'pending' as const,
      legalRetreatPaths: [['step']],
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'A retreat with a single option should have it chosen when it opens',
    );
  });
});
