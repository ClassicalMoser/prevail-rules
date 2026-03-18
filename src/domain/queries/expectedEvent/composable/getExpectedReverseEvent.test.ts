import {
  createEmptyGameState,
  createReverseState,
  createUnitWithPlacement,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';

describe('getExpectedReverseEvent', () => {
  it('should resolve reverse when the final position has not been determined yet', () => {
    const reverseState = createReverseState(createUnitWithPlacement(), {
      finalPosition: undefined,
    });
    const gameState = createEmptyGameState();

    expect(getExpectedReverseEvent(reverseState, gameState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveReverse',
    });
  });

  it('should throw when the reverse is already complete', () => {
    const reverseState = createReverseState(createUnitWithPlacement(), {
      completed: true,
      finalPosition: { coordinate: 'E-4', facing: 'south' },
    });
    const gameState = createEmptyGameState();

    expect(() => getExpectedReverseEvent(reverseState, gameState)).toThrow(
      'Reverse state is already complete',
    );
  });

  it('should throw when the final position is already set but the state is incomplete', () => {
    const reverseState = createReverseState(createUnitWithPlacement(), {
      finalPosition: { coordinate: 'E-4', facing: 'south' },
    });
    const gameState = createEmptyGameState();

    expect(() => getExpectedReverseEvent(reverseState, gameState)).toThrow(
      'Reverse state has final position but not marked as completed',
    );
  });
});
