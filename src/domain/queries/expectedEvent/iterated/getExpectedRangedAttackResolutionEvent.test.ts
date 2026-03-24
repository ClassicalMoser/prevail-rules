import {
  createEmptyGameState,
  createRangedAttackResolutionState,
  createTestCard,
} from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';

const { getExpectedAttackApplyEventMock } = vi.hoisted(() => ({
  getExpectedAttackApplyEventMock: vi.fn(),
}));

vi.mock('../composable', () => ({
  getExpectedAttackApplyEvent: getExpectedAttackApplyEventMock,
}));

/**
 * getExpectedRangedAttackResolutionEvent: next event while resolving a ranged attack command.
 */
describe('getExpectedRangedAttackResolutionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createGameState() {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();
    return state;
  }

  it('given their commitment is pending, asks the attacking player to commit', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackingCommitment: { commitmentType: 'pending' },
    });

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toEqual({
      actionType: 'playerChoice',
      playerSource: 'black',
      choiceType: 'commitToRangedAttack',
    });
  });

  it('given their commitment is pending, asks the defending player to commit', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      defendingCommitment: { commitmentType: 'pending' },
    });

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'commitToRangedAttack',
    });
  });

  it('given resolve ranged attack when both commitments are complete and no attack apply state exists', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: undefined,
    });

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    });
  });

  it('given delegate to attack apply when attack apply is in progress', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: {
        substepType: 'attackApply',
        defendingUnit: createTestCard(),
        attackResult: {
          unitRouted: true,
          unitRetreated: false,
          unitReversed: false,
        },
        routState: undefined,
        retreatState: undefined,
        reverseState: undefined,
        completed: false,
      } as never,
    });
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'attackApply',
    } as const;
    getExpectedAttackApplyEventMock.mockReturnValue(expectedEvent);

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toBe(expectedEvent);
    expect(getExpectedAttackApplyEventMock).toHaveBeenCalledWith(
      resolutionState.attackApplyState,
      gameState,
    );
  });

  it('given attack apply is complete, returns completeRangedAttackCommand', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: {
        substepType: 'attackApply',
        defendingUnit: createTestCard(),
        attackResult: {
          unitRouted: true,
          unitRetreated: false,
          unitReversed: false,
        },
        routState: undefined,
        retreatState: undefined,
        reverseState: undefined,
        completed: true,
      } as never,
    });

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toEqual({
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    });
  });

  it('given when the ranged attack resolution is already complete, throws', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toThrow('Ranged attack resolution state is already complete');
  });
});
