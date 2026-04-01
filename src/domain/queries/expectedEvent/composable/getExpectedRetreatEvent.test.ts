import {
  createRetreatState,
  createRoutState,
  createUnitWithPlacement,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';

/**
 * getExpectedRetreatEvent: next retreat-resolution event from retreat substate.
 */
describe('getExpectedRetreatEvent', () => {
  const unitPlacement = createUnitWithPlacement();

  it('given trigger rout when there are no legal retreat options and no rout state', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set(),
      finalPosition: undefined,
      routState: undefined,
    });

    expect(getExpectedRetreatEvent(retreatState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'triggerRoutFromRetreat',
    });
  });

  it('given delegate to rout when retreat has no options and rout is not complete', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set(),
      finalPosition: undefined,
      routState: createRoutState('black', unitPlacement.unit, {
        cardsChosen: false,
      }),
    });

    expect(getExpectedRetreatEvent(retreatState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given multiple options exist, asks the player to choose a retreat option', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set([
        { boardType: 'standard' as const, coordinate: 'E-4', facing: 'north' },
        { boardType: 'standard' as const, coordinate: 'E-6', facing: 'north' },
      ]),
      finalPosition: undefined,
    });

    expect(getExpectedRetreatEvent(retreatState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'black',
      choiceType: 'chooseRetreatOption',
    });
  });

  it('given the final position is already chosen, returns resolveRetreat', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set([
        { boardType: 'standard' as const, coordinate: 'E-4', facing: 'north' },
      ]),
      finalPosition: {
        boardType: 'standard' as const,
        coordinate: 'E-4',
        facing: 'north',
      },
    });

    expect(getExpectedRetreatEvent(retreatState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRetreat',
    });
  });

  it('given when the retreat is already complete, throws', () => {
    const retreatState = createRetreatState(unitPlacement, {
      completed: true,
      legalRetreatOptions: new Set([
        { boardType: 'standard' as const, coordinate: 'E-4', facing: 'north' },
      ]),
      finalPosition: {
        boardType: 'standard' as const,
        coordinate: 'E-4',
        facing: 'north',
      },
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state is already complete',
    );
  });

  it('given when rout is complete but retreat is not marked complete, throws', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set(),
      routState: createRoutState('black', unitPlacement.unit, {
        completed: true,
        numberToDiscard: 1,
        cardsChosen: true,
      }),
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state has completed rout but not marked as completed',
    );
  });

  it('given when a single retreat option was not preselected, throws', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set([
        { boardType: 'standard' as const, coordinate: 'E-4', facing: 'north' },
      ]),
      finalPosition: undefined,
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'RetreatState with single option should have finalPosition set immediately',
    );
  });
});
