import type { CleanupPhaseStep, GameState } from '@game';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createRallyResolutionState,
} from '@testing';

import { getExpectedCleanupPhaseEvent } from './getExpectedCleanupPhaseEvent';

/**
 * GetExpectedCleanupPhaseEvent: next cleanup-phase event from cleanup step and rally state.
 */
describe(getExpectedCleanupPhaseEvent, () => {
  function createGameStateInCleanupStep(
    step: CleanupPhaseStep,
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState {
    const state = createEmptyGameState({ currentInitiative });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: createRallyResolutionState({
        completed: false,
      }),
      secondPlayerRallyResolutionState: createRallyResolutionState({
        completed: false,
      }),
      step,
    });
    return state;
  }

  it('given context, returns discardPlayedCards game effect', () => {
    const state = createGameStateInCleanupStep('discardPlayedCards');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    expect(
      expectedEvent.actionType === 'gameEffect' && expectedEvent.effectType,
    ).toBe('discardPlayedCards');
  });

  it('given context, returns first player choose rally', () => {
    const state = createGameStateInCleanupStep(
      'firstPlayerChooseRally',
      'white',
    );

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    expect(
      expectedEvent.actionType === 'playerChoice' && expectedEvent.playerSource,
    ).toBe('white');
    expect(
      expectedEvent.actionType === 'playerChoice' && expectedEvent.choiceType,
    ).toBe('chooseRally');
  });

  it('given context, returns second player choose rally', () => {
    const state = createGameStateInCleanupStep(
      'secondPlayerChooseRally',
      'white',
    );

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('playerChoice');
    expect(
      expectedEvent.actionType === 'playerChoice' && expectedEvent.playerSource,
    ).toBe('black');
    expect(
      expectedEvent.actionType === 'playerChoice' && expectedEvent.choiceType,
    ).toBe('chooseRally');
  });

  it('given first player rally resolution, returns resolveRally game effect', () => {
    const state = createGameStateInCleanupStep('firstPlayerResolveRally');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    expect(
      expectedEvent.actionType === 'gameEffect' && expectedEvent.effectType,
    ).toBe('resolveRally');
  });

  it('given when first player rally resolution state is missing, throws', () => {
    const state = createGameStateInCleanupStep('firstPlayerResolveRally');
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState !== 'none' && phaseState.phase === 'cleanup') {
      phaseState.firstPlayerRallyResolutionState = 'pending';
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'First player rally resolution state not found',
    );
  });

  it('given second player rally resolution, returns resolveRally game effect', () => {
    const state = createGameStateInCleanupStep('secondPlayerResolveRally');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    expect(
      expectedEvent.actionType === 'gameEffect' && expectedEvent.effectType,
    ).toBe('resolveRally');
  });

  it('given when second player rally resolution state is missing, throws', () => {
    const state = createGameStateInCleanupStep('secondPlayerResolveRally');
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState !== 'none' && phaseState.phase === 'cleanup') {
      phaseState.secondPlayerRallyResolutionState = 'pending';
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'Second player rally resolution state not found',
    );
  });

  it('given context, returns completeCleanupPhase game effect', () => {
    const state = createGameStateInCleanupStep('complete');

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe('gameEffect');
    expect(
      expectedEvent.actionType === 'gameEffect' && expectedEvent.effectType,
    ).toBe('completeCleanupPhase');
  });

  it('given for invalid step, throws', () => {
    const state = createGameStateInCleanupStep('discardPlayedCards');
    // Force an invalid cleanup step to hit the default branch.
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState !== 'none') {
      state.currentRoundState.currentPhaseState = {
        ...phaseState,
        step: 'invalidStep',
      } as any; // Bad type cast to test default case
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'Invalid cleanup phase step: invalidStep',
    );
  });
});
