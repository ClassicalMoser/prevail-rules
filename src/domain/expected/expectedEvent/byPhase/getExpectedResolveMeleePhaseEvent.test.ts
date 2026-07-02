import type { GameStateForBoard, ResolveMeleePhaseStep } from '@game';
import type { StandardBoard } from '@entities';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';

import { getExpectedResolveMeleePhaseEvent } from './getExpectedResolveMeleePhaseEvent';
import type { ExpectedGameEffect, ExpectedPlayerInput } from '@events';

/**
 * GetExpectedResolveMeleePhaseEvent: next event during resolve-melee phase.
 */
describe(getExpectedResolveMeleePhaseEvent, () => {
  function createGameStateInResolveMeleeStep(
    step: ResolveMeleePhaseStep,
    buildOverrides?: (
      state: GameStateForBoard<StandardBoard>,
    ) => Parameters<typeof createResolveMeleePhaseState>[1],
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();
    const overrides = buildOverrides?.(state);
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        step,
        ...overrides,
      },
    );
    return state;
  }

  it('given delegate to melee resolution when a melee is in progress', () => {
    const state = createGameStateInResolveMeleeStep(
      'resolveMelee',
      (gameState) => ({
        currentMeleeResolutionState: createMeleeResolutionState(gameState, {
          blackCommitment: {
            commitmentType: 'pending' as const,
          },
        }),
      }),
    );

    const expectedEvent = getExpectedResolveMeleePhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    expect((expectedEvent as ExpectedPlayerInput).playerSource).toBe('black');
    expect((expectedEvent as ExpectedPlayerInput).choiceType).toBe(
      'commitToMelee',
    );
  });

  it('given engagements remain, asks the initiative player to choose a melee resolution', () => {
    const state = createGameStateInResolveMeleeStep('resolveMelee', () => ({
      currentMeleeResolutionState: 'pending' as const,
      remainingEngagements: ['E-5'] as const,
    }));

    const expectedEvent = getExpectedResolveMeleePhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    expect((expectedEvent as ExpectedPlayerInput).playerSource).toBe('black');
    expect((expectedEvent as ExpectedPlayerInput).choiceType).toBe(
      'chooseMeleeResolution',
    );
  });

  it('given when no engagements remain but the step did not advance, throws', () => {
    const state = createGameStateInResolveMeleeStep('resolveMelee', () => ({
      currentMeleeResolutionState: 'pending' as const,
      remainingEngagements: [] as const,
    }));

    expect(() => getExpectedResolveMeleePhaseEvent(state)).toThrow(
      'All engagements resolved but step not advanced to complete',
    );
  });

  it('given context, returns completeResolveMeleePhase game effect', () => {
    const state = createGameStateInResolveMeleeStep('complete');

    const expectedEvent = getExpectedResolveMeleePhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    expect((expectedEvent as ExpectedGameEffect).effectType).toBe(
      'completeResolveMeleePhase',
    );
  });

  it('given for invalid step, throws', () => {
    const state = createGameStateInResolveMeleeStep('complete');
    // Force an invalid resolve melee step to hit the default branch.
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState === 'none') {
      throw new Error('expected phase state');
    }
    state.currentRoundState.currentPhaseState = {
      ...phaseState,
      step: 'invalidStep',
    } as any;

    expect(() => getExpectedResolveMeleePhaseEvent(state)).toThrow(
      'Invalid resolveMelee phase step: invalidStep',
    );
  });
});
