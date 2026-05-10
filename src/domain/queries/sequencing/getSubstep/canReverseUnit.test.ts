import type { ReverseStateForBoard } from '@game';
import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { addUnitToBoard } from '@transforms';

import { canReverseUnit } from './canReverseUnit';
import type { StandardBoard } from '@entities';

/**
 * Reverse is only legal when the reversing unit is alone on its hex (opponent already left
 * after retreat/rout); engaged pairs cannot reverse.
 */
describe(canReverseUnit, () => {
  it('given single white on E-5 north in reverseState, returns true', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit,
      }),
    };

    const reverseState: ReverseStateForBoard<StandardBoard> = {
      boardType: 'standard' as const,
      completed: false,
      finalPosition: undefined,
      reversingUnit: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit,
      },
      substepType: 'reverse',
    };

    expect(canReverseUnit(reverseState, stateWithUnit)).toBeTruthy();
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

    const reverseState: ReverseStateForBoard<StandardBoard> = {
      boardType: 'standard' as const,
      completed: false,
      finalPosition: undefined,
      reversingUnit: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: primaryUnit,
      },
      substepType: 'reverse',
    };

    expect(canReverseUnit(reverseState, state)).toBeFalsy();
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

    const reverseState: ReverseStateForBoard<StandardBoard> = {
      boardType: 'standard' as const,
      completed: false,
      finalPosition: undefined,
      reversingUnit: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'south',
        },
        unit: secondaryUnit,
      },
      substepType: 'reverse',
    };

    expect(canReverseUnit(reverseState, state)).toBeFalsy();
  });

  it('given empty board but reverseState cites E-5, throws unit not present at coordinate', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();

    const reverseState: ReverseStateForBoard<StandardBoard> = {
      boardType: 'standard' as const,
      completed: false,
      finalPosition: undefined,
      reversingUnit: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit,
      },
      substepType: 'reverse',
    };

    expect(() => canReverseUnit(reverseState, state)).toThrow(
      'Unit not present at coordinate',
    );
  });
});
