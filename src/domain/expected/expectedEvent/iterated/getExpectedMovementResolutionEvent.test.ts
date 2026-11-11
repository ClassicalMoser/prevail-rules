import type { GameState, MovementResolutionState } from '@game';
import {
  createGameStateWithUnits,
  createMovementResolutionState,
  createRearEngagementState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
  placed,
} from '@testing';

import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';

import { createEmptyGameState } from '@factories';

const { getExpectedEngagementEventMock } = vi.hoisted(() => ({
  getExpectedEngagementEventMock: vi.fn(),
}));

vi.mock(import('../composable'), () => ({
  getExpectedEngagementEvent: getExpectedEngagementEventMock,
}));

function createGameStateWithTargetEnemy(): GameState {
  const state = createGameStateWithUnits([
    placed(createTestUnit('white'), 'E-6', 'north'),
  ]);
  state.cardState.black.inPlay = createTestCard();
  return state;
}

/**
 * GetExpectedMovementResolutionEvent: next event while resolving a movement command.
 */
describe('getExpectedMovementResolutionEvent function', () => {
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
    const gameState = createEmptyGameState('standard');
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
    const resolutionState: MovementResolutionState =
      createMovementResolutionState(gameState, {
        engagementState: {
          completed: true,
          engagementResolutionState: {
            retreatPaths: [['step']],
            defendingUnitRetreats: false,
            defensiveCommitment: {
              card: createTestCard(),
              commitmentType: 'completed',
            },
            engagementType: 'front',
            retreatState: 'pending' as const,
          },
          engagingUnit: createUnitWithPlacement({ playerSide: 'black' }).unit,
          substepType: 'engagementResolution',
          targetPlacement: {
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
        completed: false,
        engagementResolutionState: {
          retreatPaths: 'pending' as const,
          defendingUnitRetreats: 'pending' as const,
          defensiveCommitment: {
            card: createTestCard(),
            commitmentType: 'completed',
          },
          engagementType: 'front',
          retreatState: 'pending' as const,
        },
        engagingUnit: createUnitWithPlacement({ playerSide: 'black' }).unit,
        substepType: 'engagementResolution',
        targetPlacement: {
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

  it('a rear engagement under way decides what comes next, though its defender has left the board', () => {
    // §6.3.3: a rear engagement routs the defender off the board at once,
    // but its owner still owes the Morale. The empty target space must not
    // end the move before that rout is paid.
    const gameState = createEmptyGameState('standard');
    gameState.cardState.black.inPlay = createTestCard();
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: createRearEngagementState(),
    });
    // What the rout asks for next is the engagement's own question.
    const routEvent = {
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    } as const;
    getExpectedEngagementEventMock.mockReturnValue(routEvent);

    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toBe(routEvent);
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
