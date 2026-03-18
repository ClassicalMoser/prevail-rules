import {
  createRetreatState,
  createRoutState,
  createUnitWithPlacement,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';

describe('getExpectedRetreatEvent', () => {
  const unitPlacement = createUnitWithPlacement();

  it('should trigger rout when there are no legal retreat options and no rout state', () => {
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

  it('should delegate to rout when retreat has no options and rout is not complete', () => {
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

  it('should ask the player to choose a retreat option when multiple options exist', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set([
        { coordinate: 'E-4', facing: 'north' },
        { coordinate: 'E-6', facing: 'north' },
      ]),
      finalPosition: undefined,
    });

    expect(getExpectedRetreatEvent(retreatState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'black',
      choiceType: 'chooseRetreatOption',
    });
  });

  it('should return resolveRetreat when the final position is already chosen', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set([{ coordinate: 'E-4', facing: 'north' }]),
      finalPosition: { coordinate: 'E-4', facing: 'north' },
    });

    expect(getExpectedRetreatEvent(retreatState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRetreat',
    });
  });

  it('should throw when the retreat is already complete', () => {
    const retreatState = createRetreatState(unitPlacement, {
      completed: true,
      legalRetreatOptions: new Set([{ coordinate: 'E-4', facing: 'north' }]),
      finalPosition: { coordinate: 'E-4', facing: 'north' },
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state is already complete',
    );
  });

  it('should throw when rout is complete but retreat is not marked complete', () => {
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

  it('should throw when a single retreat option was not preselected', () => {
    const retreatState = createRetreatState(unitPlacement, {
      legalRetreatOptions: new Set([{ coordinate: 'E-4', facing: 'north' }]),
      finalPosition: undefined,
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'RetreatState with single option should have finalPosition set immediately',
    );
  });
});
