import {
  createEmptyGameState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getExpectedCommandResolutionEvent } from './getExpectedCommandResolutionEvent';

const {
  getExpectedMovementResolutionEventMock,
  getExpectedRangedAttackResolutionEventMock,
} = vi.hoisted(() => ({
  getExpectedMovementResolutionEventMock: vi.fn(),
  getExpectedRangedAttackResolutionEventMock: vi.fn(),
}));

vi.mock('./getExpectedMovementResolutionEvent', () => ({
  getExpectedMovementResolutionEvent: getExpectedMovementResolutionEventMock,
}));
vi.mock('./getExpectedRangedAttackResolutionEvent', () => ({
  getExpectedRangedAttackResolutionEvent:
    getExpectedRangedAttackResolutionEventMock,
}));

describe('getExpectedCommandResolutionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate movement command resolution to the movement resolver', () => {
    const gameState = createEmptyGameState();
    const resolutionState = createMovementResolutionState(gameState);
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'move',
    } as const;
    getExpectedMovementResolutionEventMock.mockReturnValue(expectedEvent);

    expect(
      getExpectedCommandResolutionEvent(gameState, resolutionState, 'black'),
    ).toBe(expectedEvent);
    expect(getExpectedMovementResolutionEventMock).toHaveBeenCalledWith(
      gameState,
      resolutionState,
      'black',
    );
  });

  it('should delegate ranged attack command resolution to the ranged attack resolver', () => {
    const gameState = createEmptyGameState();
    const resolutionState = createRangedAttackResolutionState(gameState);
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'attack',
    } as const;
    getExpectedRangedAttackResolutionEventMock.mockReturnValue(expectedEvent);

    expect(
      getExpectedCommandResolutionEvent(gameState, resolutionState, 'white'),
    ).toBe(expectedEvent);
    expect(getExpectedRangedAttackResolutionEventMock).toHaveBeenCalledWith(
      gameState,
      resolutionState,
      'white',
    );
  });

  it('should throw when no command resolution state exists', () => {
    const gameState = createEmptyGameState();

    expect(() =>
      getExpectedCommandResolutionEvent(gameState, undefined, 'black'),
    ).toThrow('No command resolution state found');
  });

  it('should throw for an invalid command resolution type', () => {
    const gameState = createEmptyGameState();
    const resolutionState = {
      ...createMovementResolutionState(gameState),
      commandResolutionType: 'invalid',
    } as never;

    expect(() =>
      getExpectedCommandResolutionEvent(gameState, resolutionState, 'black'),
    ).toThrow('Invalid command resolution type: invalid');
  });
});
