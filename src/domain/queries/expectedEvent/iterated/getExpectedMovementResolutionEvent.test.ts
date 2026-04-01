import type { StandardBoard } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import type { StandardEngagementState } from '@game/substeps';
import {
  createEmptyGameState,
  createGameStateWithUnits,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';

const { getExpectedEngagementEventMock } = vi.hoisted(() => ({
  getExpectedEngagementEventMock: vi.fn(),
}));

vi.mock('../composable', () => ({
  getExpectedEngagementEvent: getExpectedEngagementEventMock,
}));

/**
 * getExpectedMovementResolutionEvent: next event while resolving a movement command.
 */
describe('getExpectedMovementResolutionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createGameStateWithTargetEnemy(): StandardGameState {
    const state = createGameStateWithUnits([
      {
        unit: createTestUnit('white'),
        coordinate: 'E-6',
        facing: 'north',
      },
    ]);
    state.cardState.black.inPlay = createTestCard();
    return state;
  }

  it('given commitment is pending, asks the player to commit to movement', () => {
    const gameState = createGameStateWithUnits([]);
    gameState.cardState.black.inPlay = createTestCard();
    const resolutionState = createMovementResolutionState(gameState, {
      commitment: {
        commitmentType: 'pending',
      },
    });

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toEqual({
      actionType: 'playerChoice',
      playerSource: 'black',
      choiceType: 'commitToMovement',
    });
  });

  it('given start an engagement when the target space contains an enemy unit', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState = createMovementResolutionState(gameState);

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toEqual({
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
    ).toEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('given complete unit movement when engagement is already complete', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: {
        substepType: 'engagementResolution',
        boardType: 'standard' as const,
        engagingUnit: createUnitWithPlacement({ playerSide: 'black' }).unit,
        targetPlacement: {
          boardType: 'standard' as const,
          coordinate: 'E-6',
          facing: 'north',
        },
        engagementResolutionState: {
          engagementType: 'front',
          defensiveCommitment: {
            commitmentType: 'completed',
            card: createTestCard(),
          },
          defendingUnitCanRetreat: true,
          defendingUnitRetreats: false,
          defendingUnitRetreated: undefined,
        },
        completed: false,
      } as StandardEngagementState,
    });
    resolutionState.engagementState = {
      ...resolutionState.engagementState,
      completed: true,
    } as StandardEngagementState;

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('given delegate to engagement resolution when engagement is in progress', () => {
    const gameState = createGameStateWithTargetEnemy();
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: {
        substepType: 'engagementResolution',
        boardType: 'standard' as const,
        engagingUnit: createUnitWithPlacement({ playerSide: 'black' }).unit,
        targetPlacement: {
          boardType: 'standard' as const,
          coordinate: 'E-6',
          facing: 'north',
        },
        engagementResolutionState: {
          engagementType: 'front',
          defensiveCommitment: {
            commitmentType: 'completed',
            card: createTestCard(),
          },
          defendingUnitCanRetreat: undefined,
          defendingUnitRetreats: undefined,
          defendingUnitRetreated: undefined,
        },
        completed: false,
      } as StandardEngagementState,
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
      gameState,
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
