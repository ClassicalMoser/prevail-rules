import {
  createAttackApplyState,
  createEmptyGameState,
  createMeleeResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getExpectedMeleeResolutionEvent } from './getExpectedMeleeResolutionEvent';

const { getExpectedAttackApplyEventMock } = vi.hoisted(() => ({
  getExpectedAttackApplyEventMock: vi.fn(),
}));

vi.mock('../composable', () => ({
  getExpectedAttackApplyEvent: getExpectedAttackApplyEventMock,
}));

/**
 * getExpectedMeleeResolutionEvent: next event while resolving a melee attack.
 */
describe('getExpectedMeleeResolutionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createGameState() {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();
    return state;
  }

  it('given their commitment is pending, asks the first player to commit', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      blackCommitment: { commitmentType: 'pending' },
    });

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'black',
      choiceType: 'commitToMelee',
    });
  });

  it('given their commitment is pending, asks the second player to commit', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      whiteCommitment: { commitmentType: 'pending' },
    });

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'commitToMelee',
    });
  });

  it('given resolve melee when both commitments are complete and no attack apply state exists', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      blackAttackApplyState: undefined,
      whiteAttackApplyState: undefined,
    });

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    });
  });

  it('given delegate to the first player attack apply state when it is incomplete', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      blackAttackApplyState: createAttackApplyState(createTestUnit('white')),
      whiteAttackApplyState: createAttackApplyState(createTestUnit('black'), {
        completed: true,
      }),
    });
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'attackApply',
    } as const;
    getExpectedAttackApplyEventMock.mockReturnValue(expectedEvent);

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toBe(
      expectedEvent,
    );
    expect(getExpectedAttackApplyEventMock).toHaveBeenCalledWith(
      meleeState.blackAttackApplyState,
      gameState,
    );
  });

  it('given delegate to the second player attack apply state when the first one is complete', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      blackAttackApplyState: createAttackApplyState(createTestUnit('white'), {
        completed: true,
      }),
      whiteAttackApplyState: createAttackApplyState(createTestUnit('black')),
    });
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'attackApply',
    } as const;
    getExpectedAttackApplyEventMock.mockReturnValue(expectedEvent);

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toBe(
      expectedEvent,
    );
    expect(getExpectedAttackApplyEventMock).toHaveBeenCalledWith(
      meleeState.whiteAttackApplyState,
      gameState,
    );
  });

  it('given both attack apply states are complete, returns completeMeleeResolution', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      blackAttackApplyState: createAttackApplyState(createTestUnit('white'), {
        completed: true,
      }),
      whiteAttackApplyState: createAttackApplyState(createTestUnit('black'), {
        completed: true,
      }),
    });

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'completeMeleeResolution',
    });
  });

  it('given when the melee resolution is already complete, throws', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toThrow('Melee resolution state is already complete');
  });
});
