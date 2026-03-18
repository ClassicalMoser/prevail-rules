import type {
  GameState,
  ResolveMeleePhaseStep,
  StandardBoard,
} from '@entities';
import { expectedGameEffectSchema, expectedPlayerInputSchema } from '@entities';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedResolveMeleePhaseEvent } from './getExpectedResolveMeleePhaseEvent';

describe('getExpectedResolveMeleePhaseEvent', () => {
  function createGameStateInResolveMeleeStep(
    step: ResolveMeleePhaseStep,
    buildOverrides?: (
      state: GameState<StandardBoard>,
    ) => Parameters<typeof createResolveMeleePhaseState>[1],
  ): GameState<StandardBoard> {
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

  it('should delegate to melee resolution when a melee is in progress', () => {
    const state = createGameStateInResolveMeleeStep(
      'resolveMelee',
      (state) => ({
        currentMeleeResolutionState: createMeleeResolutionState(state, {
          blackCommitment: {
            commitmentType: 'pending',
          },
        }),
      }),
    );

    const expectedEvent = getExpectedResolveMeleePhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('black');
    expect(parsed.data?.choiceType).toBe('commitToMelee');
  });

  it('should ask the initiative player to choose a melee resolution when engagements remain', () => {
    const state = createGameStateInResolveMeleeStep('resolveMelee', () => ({
      currentMeleeResolutionState: undefined,
      remainingEngagements: new Set(['E-5']),
    }));

    const expectedEvent = getExpectedResolveMeleePhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('black');
    expect(parsed.data?.choiceType).toBe('chooseMeleeResolution');
  });

  it('should throw when no engagements remain but the step did not advance', () => {
    const state = createGameStateInResolveMeleeStep('resolveMelee', () => ({
      currentMeleeResolutionState: undefined,
      remainingEngagements: new Set(),
    }));

    expect(() => getExpectedResolveMeleePhaseEvent(state)).toThrow(
      'All engagements resolved but step not advanced to complete',
    );
  });

  it('should return completeResolveMeleePhase game effect', () => {
    const state = createGameStateInResolveMeleeStep('complete');

    const expectedEvent = getExpectedResolveMeleePhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    const parsed = expectedGameEffectSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('completeResolveMeleePhase');
  });

  it('should throw for invalid step', () => {
    const state = createGameStateInResolveMeleeStep('complete');
    // Force an invalid resolve melee step to hit the default branch.
    state.currentRoundState.currentPhaseState = {
      ...state.currentRoundState.currentPhaseState,
      step: 'invalidStep',
    } as any;

    expect(() => getExpectedResolveMeleePhaseEvent(state)).toThrow(
      'Invalid resolveMelee phase step: invalidStep',
    );
  });
});
