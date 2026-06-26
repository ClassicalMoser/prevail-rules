import type { StandardBoard } from '@entities';
import type { GameStateForBoard, MovementResolutionStateForBoard } from '@game';
import {
  createEmptyGameState,
  createGameStateWithUnits,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';

import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';

const { getExpectedEngagementEventMock } = vi.hoisted(() => ({
  getExpectedEngagementEventMock: vi.fn(),
}));

vi.mock(import('../composable'), () => ({
  getExpectedEngagementEvent: getExpectedEngagementEventMock,
}));

function createGameStateWithTargetEnemy(): GameStateForBoard<StandardBoard> {
  const state = createGameStateWithUnits([
    {
      coordinate: 'E-6',
      facing: 'north',
      unit: createTestUnit('white'),
    },
  ]);
  state.cardState.black.inPlay = createTestCard();
  return state;
}

/**
 * GetExpectedMovementResolutionEvent: next event while resolving a movement command.
 */
describe(getExpectedMovementResolutionEvent, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given commitment is pending, asks the player to commit to movement', () => {
    const gameState = createGameStateWithUnits([]);
    gameState.cardState.black.inPlay = createTestCard();
    const resolutionState = createMovementResolutionState(gameState, {
      commitment: {
        commitmentType: 'pending' as const,
      },
    });

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: 'black',
    });
  });

  it('given start an engagement when the target space contains an enemy unit', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState = createMovementResolutionState(gameState);

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'startEngagement',
    });
  });

  it('given complete unit movement when the target space has no enemy unit', () => {
    const gameState = createEmptyGameState();
    gameState.cardState.black.inPlay = createTestCard();
    const resolutionState = createMovementResolutionState(gameState);

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('given complete unit movement when engagement is already complete', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState: MovementResolutionStateForBoard<StandardBoard> =
      createMovementResolutionState(gameState, {
        engagementState: {
          boardType: 'standard' as const,
          completed: true,
          engagementResolutionState: {
            defendingUnitCanRetreat: true,
            defendingUnitRetreated: 'pending' as const,
            defendingUnitRetreats: false,
            defensiveCommitment: {
              card: createTestCard(),
              commitmentType: 'completed',
            },
            engagementType: 'front',
          },
          engagingUnit: createUnitWithPlacement({ playerSide: 'black' }).unit,
          substepType: 'engagementResolution',
          targetPlacement: {
            boardType: 'standard' as const,
            coordinate: 'E-6',
            facing: 'north',
          },
        },
      });

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('given delegate to engagement resolution when engagement is in progress', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: {
        boardType: 'standard' as const,
        completed: false,
        engagementResolutionState: {
          defendingUnitCanRetreat: 'pending' as const,
          defendingUnitRetreated: 'pending' as const,
          defendingUnitRetreats: 'pending' as const,
          defensiveCommitment: {
            card: createTestCard(),
            commitmentType: 'completed',
          },
          engagementType: 'front',
        },
        engagingUnit: createUnitWithPlacement({ playerSide: 'black' }).unit,
        substepType: 'engagementResolution',
        targetPlacement: {
          boardType: 'standard' as const,
          coordinate: 'E-6',
          facing: 'north',
        },
      },
    });
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'engagement',
    } as const;
    getExpectedEngagementEventMock.mockReturnValue(expectedEvent);

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toBe(expectedEvent);
    expect(getExpectedEngagementEventMock).toHaveBeenCalledWith(
      resolutionState.engagementState,
    );
  });

  it('given when the movement resolution is already complete, throws', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState = createMovementResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toThrow('Movement resolution state is already complete');
  });
});
