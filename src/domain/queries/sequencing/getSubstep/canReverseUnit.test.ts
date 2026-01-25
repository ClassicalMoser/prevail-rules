import type { ReverseState, StandardBoard } from '@entities';
import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { addUnitToBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { canReverseUnit } from './canReverseUnit';

describe('canReverseUnit', () => {
  it('should return true when unit is not engaged (single unit)', () => {
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

  it('should return false when unit is engaged', () => {
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

  it('should return false when secondary unit in engagement tries to reverse', () => {
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

  it('should throw error when coordinate has no unit', () => {
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
