import type { ChooseRallyEvent } from '@events';
import { CLEANUP_PHASE } from '@game';

import { getCleanupPhaseState } from '@queries';
import { createCleanupPhaseState, createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseRallyEvent } from './applyChooseRallyEvent';

/**
 * Cleanup rally prompts: `performRally` seeds the per-player rally resolution slice and moves
 * the cleanup step forward (resolve rally vs skip to next chooser or complete).
 */
describe(applyChooseRallyEvent, () => {
  it('given firstPlayerChooseRally and performRally true, step firstPlayerResolveRally and playerRallied true', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: 'playerChoice',
      performRally: true,
      player: 'black',
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('firstPlayerResolveRally');
    expect(
      newPhaseState.firstPlayerRallyResolutionState?.playerRallied,
    ).toBeTruthy();
  });

  it('given firstPlayerChooseRally and performRally false, step secondPlayerChooseRally and playerRallied false', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: 'playerChoice',
      performRally: false,
      player: 'black',
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('secondPlayerChooseRally');
    expect(
      newPhaseState.firstPlayerRallyResolutionState?.playerRallied,
    ).toBeFalsy();
  });

  it('given secondPlayerChooseRally and performRally true, step secondPlayerResolveRally and playerRallied true', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'secondPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: 'playerChoice',
      performRally: true,
      player: 'white',
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('secondPlayerResolveRally');
    expect(
      newPhaseState.secondPlayerRallyResolutionState?.playerRallied,
    ).toBeTruthy();
  });

  it('given secondPlayerChooseRally and performRally false, step complete and second playerRallied false', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'secondPlayerChooseRally',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: 'playerChoice',
      performRally: false,
      player: 'white',
    };

    const newState = applyChooseRallyEvent(event, stateInStep);
    const newPhaseState = getCleanupPhaseState(newState);

    expect(newPhaseState.step).toBe('complete');
    expect(
      newPhaseState.secondPlayerRallyResolutionState?.playerRallied,
    ).toBeFalsy();
  });

  it('given cleanup on discardPlayedCards, throws chooseRally step guard', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards',
    });
    const stateInStep = updatePhaseState(state, phaseState);
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: 'playerChoice',
      performRally: true,
      player: 'black',
    };

    expect(() => applyChooseRallyEvent(event, stateInStep)).toThrow(
      'Cleanup phase is not on a chooseRally step: discardPlayedCards',
    );
  });
});
