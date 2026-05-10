import {
  createEmptyGameState,
  createRangedAttackResolutionState,
  createTestCard,
} from '@testing';

import { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';

const { getExpectedAttackApplyEventMock } = vi.hoisted(() => ({
  getExpectedAttackApplyEventMock: vi.fn(),
}));

vi.mock(import('../composable'), () => ({
  getExpectedAttackApplyEvent: getExpectedAttackApplyEventMock,
}));

/**
 * GetExpectedRangedAttackResolutionEvent: next event while resolving a ranged attack command.
 */
describe(getExpectedRangedAttackResolutionEvent, () => {
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
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      playerSource: 'black',
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
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      playerSource: 'white',
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
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    });
  });

  it('given delegate to attack apply when attack apply is in progress', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: {
        attackResult: {
          unitRetreated: false,
          unitReversed: false,
          unitRouted: true,
        },
        completed: false,
        defendingUnit: createTestCard(),
        retreatState: undefined,
        reverseState: undefined,
        routState: undefined,
        substepType: 'attackApply',
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
        attackResult: {
          unitRetreated: false,
          unitReversed: false,
          unitRouted: true,
        },
        completed: true,
        defendingUnit: createTestCard(),
        retreatState: undefined,
        reverseState: undefined,
        routState: undefined,
        substepType: 'attackApply',
      } as never,
    });

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
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
