import { createRangedAttackResolutionState, createTestCard } from '@testing';

import { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';

import { createEmptyGameState } from '@factories';

const { getExpectedAttackApplyEventMock } = vi.hoisted(() => ({
  getExpectedAttackApplyEventMock: vi.fn(),
}));

vi.mock(import('../composable'), () => ({
  getExpectedAttackApplyEvent: getExpectedAttackApplyEventMock,
}));

/**
 * GetExpectedRangedAttackResolutionEvent: next event while resolving a ranged attack command.
 */
describe('getExpectedRangedAttackResolutionEvent function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createGameState() {
    const state = createEmptyGameState('standard');
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

  it('once the shooter has committed, asks it to name its target', () => {
    const gameState = createGameState();
    // Black refused to commit; nothing is aimed yet (§4.3.11 step 3).
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackingCommitment: { commitmentType: 'declined' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });

    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'performRangedAttack',
      playerSource: 'black',
    });
  });

  it('asks the shooter for its commitment before its target, even with nothing aimed', () => {
    const gameState = createGameState();
    // The shooter is named and nothing else: the card comes first (§4.3.11 step 2).
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackingCommitment: { commitmentType: 'pending' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
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

  it('once the target is named, asks its owner to commit for Defence or Flexibility', () => {
    const gameState = createGameState();
    // Black's shot is aimed at the white unit the fixture names.
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
      choiceType: 'commitToRangedDefense',
      playerSource: 'white',
    });
  });

  it('given resolve ranged attack when both commitments are complete and no attack apply state exists', () => {
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: 'pending' as const,
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
        retreatState: 'pending' as const,
        reverseState: 'pending' as const,
        routState: 'pending' as const,
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
    );
  });

  it('once the shot’s result is settled, expects the shot to be completed', () => {
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
        retreatState: 'pending' as const,
        reverseState: 'pending' as const,
        routState: 'pending' as const,
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
      effectType: 'completeRangedAttack',
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
