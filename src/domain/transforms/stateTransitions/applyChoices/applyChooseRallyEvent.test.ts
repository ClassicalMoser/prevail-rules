import type { StandardBoard } from '@entities';
import type { ChooseRallyEvent } from '@events';
import { CLEANUP_PHASE } from '@entities';
import { getCleanupPhaseState } from '@queries';
import { createCleanupPhaseState, createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseRallyEvent } from './applyChooseRallyEvent';

describe('applyChooseRallyEvent', () => {
  it('from firstPlayerChooseRally with performRally true advances to firstPlayerResolveRally', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRally',
      player: 'black',
      performRally: true,
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('firstPlayerResolveRally');
    expect(newPhaseState.firstPlayerRallyResolutionState?.playerRallied).toBe(
      true,
    );
  });

  it('from firstPlayerChooseRally with performRally false advances to secondPlayerChooseRally', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRally',
      player: 'black',
      performRally: false,
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('secondPlayerChooseRally');
    expect(newPhaseState.firstPlayerRallyResolutionState?.playerRallied).toBe(
      false,
    );
  });

  it('from secondPlayerChooseRally with performRally true advances to secondPlayerResolveRally', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'secondPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRally',
      player: 'white',
      performRally: true,
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('secondPlayerResolveRally');
    expect(newPhaseState.secondPlayerRallyResolutionState?.playerRallied).toBe(
      true,
    );
  });

  it('from secondPlayerChooseRally with performRally false advances to complete', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'secondPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRally',
      player: 'white',
      performRally: false,
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('complete');
    expect(newPhaseState.secondPlayerRallyResolutionState?.playerRallied).toBe(
      false,
    );
  });

  it('throws when cleanup phase is not on a chooseRally step', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRally',
      player: 'black',
      performRally: true,
    };

    expect(() => applyChooseRallyEvent(event, stateInStep)).toThrow(
      'Cleanup phase is not on a chooseRally step: discardPlayedCards',
    );
  });
});
