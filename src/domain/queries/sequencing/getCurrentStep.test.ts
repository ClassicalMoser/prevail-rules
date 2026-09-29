import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';

import { getCurrentStep } from './getCurrentStep';

import { createEmptyGameState } from '@factories';
/**
 * Reads the active round step string from whatever phase object is current (playCards,
 * issueCommands, resolveMelee, cleanup, etc.).
 */
describe(getCurrentStep, () => {
  it('given playCards chooseCards factory, step is chooseCards', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    const result = getCurrentStep(state);
    expect(result).toBe('chooseCards');
  });

  it('given default issueCommands factory, step is firstPlayerResolveCommands', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    const result = getCurrentStep(state);
    expect(result).toBe('firstPlayerResolveCommands');
  });

  it('given default resolveMelee phase, step is resolveMelee', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getCurrentStep(state);
    expect(result).toBe('resolveMelee');
  });

  it('given cleanup firstPlayerChooseRally, step matches that step', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });

    const result = getCurrentStep(state);
    expect(result).toBe('firstPlayerChooseRally');
  });

  it('given undefined currentPhaseState, throws no current phase state', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = 'none';

    expect(() => getCurrentStep(state)).toThrow('No current phase state found');
  });
});
