import type { GameState, ResolveMeleePhaseStep } from '@game';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';

import { getExpectedResolveMeleePhaseEvent } from './getExpectedResolveMeleePhaseEvent';
import type { ExpectedGameEffect, ExpectedPlayerInput } from '@events';

import { createEmptyGameState } from '@factories';
/**
 * GetExpectedResolveMeleePhaseEvent: next event during resolve-melee phase.
 */
describe(getExpectedResolveMeleePhaseEvent, () => {
  function createGameStateInResolveMeleeStep(
    step: ResolveMeleePhaseStep,
    buildOverrides?: (
      state: GameState,
    ) => Parameters<typeof createResolveMeleePhaseState>[1],
  ): GameState {
    const state = createEmptyGameState('standard');
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

  it('given no engagements remain, returns completeResolveMeleePhase', () => {
    const state = createGameStateInResolveMeleeStep('resolveMelee', () => ({
      currentMeleeResolutionState: 'pending' as const,
      remainingEngagements: [] as const,
    }));

    expect(getExpectedResolveMeleePhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeResolveMeleePhase',
    });
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
    phaseState.step = 'invalidStep' as unknown as typeof phaseState.step; // Intentionally bad type cast to test error path

    expect(() => getExpectedResolveMeleePhaseEvent(state)).toThrow(
      'Invalid resolveMelee phase step: invalidStep',
    );
  });
});
