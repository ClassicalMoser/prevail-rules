import type { ReverseState, StandardBoard } from '@entities';
import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { addUnitToBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { canReverseUnit } from './canReverseUnit';

/**
 * Reverse is only legal when the reversing unit is alone on its hex (opponent already left
 * after retreat/rout); engaged pairs cannot reverse.
 */
describe('canReverseUnit', () => {
  it('given single white on E-5 north in reverseState, returns true', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      }),
    };

    const reverseState: ReverseState<StandardBoard> = {
      substepType: 'reverse',
      reversingUnit: {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      },
      finalPosition: undefined,
      completed: false,
    };

    expect(canReverseUnit(reverseState, stateWithUnit)).toBe(true);
  });

  it('given primary white engaged on E-5, primary reverse attempt returns false', () => {
    const primaryUnit = createTestUnit('white', { attack: 2 });
    const secondaryUnit = createTestUnit('black', { attack: 2 });
    const state = createGameStateWithEngagedUnits(
      primaryUnit,
      secondaryUnit,
      'E-5',
      'north',
    );

    const reverseState: ReverseState<StandardBoard> = {
      substepType: 'reverse',
      reversingUnit: {
        unit: primaryUnit,
        placement: { coordinate: 'E-5', facing: 'north' },
      },
      finalPosition: undefined,
      completed: false,
    };

    expect(canReverseUnit(reverseState, state)).toBe(false);
  });

  it('given same engagement, secondary black reverse attempt also false', () => {
    const primaryUnit = createTestUnit('white', { attack: 2 });
    const secondaryUnit = createTestUnit('black', { attack: 2 });
    const state = createGameStateWithEngagedUnits(
      primaryUnit,
      secondaryUnit,
      'E-5',
      'north',
    );

    const reverseState: ReverseState<StandardBoard> = {
      substepType: 'reverse',
      reversingUnit: {
        unit: secondaryUnit,
        placement: { coordinate: 'E-5', facing: 'south' },
      },
      finalPosition: undefined,
      completed: false,
    };

    expect(canReverseUnit(reverseState, state)).toBe(false);
  });

  it('given empty board but reverseState cites E-5, throws unit not present at coordinate', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();

    const reverseState: ReverseState<StandardBoard> = {
      substepType: 'reverse',
      reversingUnit: {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      },
      finalPosition: undefined,
      completed: false,
    };

    expect(() => canReverseUnit(reverseState, state)).toThrow(
      'Unit not present at coordinate',
    );
  });
});
