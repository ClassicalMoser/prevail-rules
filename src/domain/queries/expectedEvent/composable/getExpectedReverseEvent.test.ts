import {
  createEmptyGameState,
  createReverseState,
  createUnitWithPlacement,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';

/**
 * getExpectedReverseEvent: next reverse-resolution event from reverse substate.
 */
describe('getExpectedReverseEvent', () => {
  const unitPlacement = createUnitWithPlacement();

  it('given resolve reverse when the final position has not been determined yet', () => {
    const reverseState = createReverseState(unitPlacement);
    const gameState = createEmptyGameState();

    expect(getExpectedReverseEvent(reverseState, gameState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveReverse',
    });
  });

  it('given when the reverse is already complete, throws', () => {
    const reverseState = createReverseState(unitPlacement, {
      completed: true,
      finalPosition: { coordinate: 'E-4', facing: 'south' },
    });
    const gameState = createEmptyGameState();

    expect(() => getExpectedReverseEvent(reverseState, gameState)).toThrow(
      'Reverse state is already complete',
    );
  });

  it('given when the final position is already set but the state is incomplete, throws', () => {
    const reverseState = createReverseState(unitPlacement, {
      finalPosition: { coordinate: 'E-4', facing: 'south' },
    });
    const gameState = createEmptyGameState();

    expect(() => getExpectedReverseEvent(reverseState, gameState)).toThrow(
      'Reverse state has final position but not marked as completed',
    );
  });
});
