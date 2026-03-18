import type { CleanupPhaseStep, GameState, StandardBoard } from '@entities';
import { expectedGameEffectSchema, expectedPlayerInputSchema } from '@entities';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createRallyResolutionState,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedCleanupPhaseEvent } from './getExpectedCleanupPhaseEvent';

describe('getExpectedCleanupPhaseEvent', () => {
  function createGameStateInCleanupStep(
    step: CleanupPhaseStep,
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step,
      firstPlayerRallyResolutionState: createRallyResolutionState({
        completed: false,
      }),
      secondPlayerRallyResolutionState: createRallyResolutionState({
        completed: false,
      }),
    });
    return state;
  }

  it('should return discardPlayedCards game effect', () => {
    const state = createGameStateInCleanupStep('discardPlayedCards');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    const parsed = expectedGameEffectSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('discardPlayedCards');
  });

  it('should return first player choose rally', () => {
    const state = createGameStateInCleanupStep(
      'firstPlayerChooseRally',
      'white',
    );

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('white');
    expect(parsed.data?.choiceType).toBe('chooseRally');
  });

  it('should return second player choose rally', () => {
    const state = createGameStateInCleanupStep(
      'secondPlayerChooseRally',
      'white',
    );

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    const parsed = expectedPlayerInputSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe('black');
    expect(parsed.data?.choiceType).toBe('chooseRally');
  });

  it('should return resolveRally game effect for first player rally resolution', () => {
    const state = createGameStateInCleanupStep('firstPlayerResolveRally');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    const parsed = expectedGameEffectSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('resolveRally');
  });

  it('should throw when first player rally resolution state is missing', () => {
    const state = createGameStateInCleanupStep('firstPlayerResolveRally');
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState?.phase === 'cleanup') {
      phaseState.firstPlayerRallyResolutionState = undefined;
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'First player rally resolution state not found',
    );
  });

  it('should return resolveRally game effect for second player rally resolution', () => {
    const state = createGameStateInCleanupStep('secondPlayerResolveRally');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    const parsed = expectedGameEffectSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('resolveRally');
  });

  it('should throw when second player rally resolution state is missing', () => {
    const state = createGameStateInCleanupStep('secondPlayerResolveRally');
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState?.phase === 'cleanup') {
      phaseState.secondPlayerRallyResolutionState = undefined;
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'Second player rally resolution state not found',
    );
  });

  it('should return completeCleanupPhase game effect', () => {
    const state = createGameStateInCleanupStep('complete');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    const parsed = expectedGameEffectSchema.safeParse(expectedEvent);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('completeCleanupPhase');
  });

  it('should throw for invalid step', () => {
    const state = createGameStateInCleanupStep('discardPlayedCards');
    // Force an invalid cleanup step to hit the default branch.
    state.currentRoundState.currentPhaseState = {
      ...state.currentRoundState.currentPhaseState,
      step: 'invalidStep',
    } as any; // Bad type cast to test default case

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'Invalid cleanup phase step: invalidStep',
    );
  });
});
