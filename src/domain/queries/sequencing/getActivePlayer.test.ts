import {
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
} from '@testing';
import { describe, expect, it } from 'vitest';
import {
  getActivePlayerForCleanupStep,
  getActivePlayerForIssueCommandsStep,
  getActivePlayerForMoveCommandersStep,
} from './getActivePlayer';

describe('getActivePlayerForMoveCommandersStep', () => {
  it('should return initiative player for moveFirstCommander step', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    state.currentRoundState.currentPhaseState =
      createMoveCommandersPhaseState({ step: 'moveFirstCommander' });

    expect(getActivePlayerForMoveCommandersStep(state)).toBe('white');
  });

  it('should return other player for moveSecondCommander step', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    state.currentRoundState.currentPhaseState =
      createMoveCommandersPhaseState({ step: 'moveSecondCommander' });

    expect(getActivePlayerForMoveCommandersStep(state)).toBe('black');
  });

  it('should throw for complete step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createMoveCommandersPhaseState({ step: 'complete' });

    expect(() => getActivePlayerForMoveCommandersStep(state)).toThrow(
      'No active player for moveCommanders complete step',
    );
  });

  it('should throw when not in moveCommanders phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    expect(() => getActivePlayerForMoveCommandersStep(state)).toThrow(
      'Expected moveCommanders phase',
    );
  });
});

describe('getActivePlayerForCleanupStep', () => {
  it('should return initiative player for firstPlayerChooseRally step', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });

    expect(getActivePlayerForCleanupStep(state)).toBe('black');
  });

  it('should return other player for secondPlayerChooseRally step', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'secondPlayerChooseRally',
    });

    expect(getActivePlayerForCleanupStep(state)).toBe('white');
  });

  it('should return initiative player for firstPlayerResolveRally step', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerResolveRally',
    });

    expect(getActivePlayerForCleanupStep(state)).toBe('white');
  });

  it('should return other player for secondPlayerResolveRally step', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'secondPlayerResolveRally',
    });

    expect(getActivePlayerForCleanupStep(state)).toBe('black');
  });

  it('should throw for discardPlayedCards step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'discardPlayedCards',
    });

    expect(() => getActivePlayerForCleanupStep(state)).toThrow(
      'No active player for cleanup discardPlayedCards step',
    );
  });

  it('should throw for complete step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'complete',
    });

    expect(() => getActivePlayerForCleanupStep(state)).toThrow(
      'No active player for cleanup complete step',
    );
  });
});

describe('getActivePlayerForIssueCommandsStep', () => {
  it('should return initiative player for firstPlayerIssueCommands step', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state, {
        step: 'firstPlayerIssueCommands',
      });

    expect(getActivePlayerForIssueCommandsStep(state)).toBe('black');
  });

  it('should return initiative player for firstPlayerResolveCommands step', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state, {
        step: 'firstPlayerResolveCommands',
      });

    expect(getActivePlayerForIssueCommandsStep(state)).toBe('black');
  });

  it('should return other player for secondPlayerIssueCommands step', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state, {
        step: 'secondPlayerIssueCommands',
      });

    expect(getActivePlayerForIssueCommandsStep(state)).toBe('white');
  });

  it('should return other player for secondPlayerResolveCommands step', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state, {
        step: 'secondPlayerResolveCommands',
      });

    expect(getActivePlayerForIssueCommandsStep(state)).toBe('white');
  });

  it('should throw for complete step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state, { step: 'complete' });

    expect(() => getActivePlayerForIssueCommandsStep(state)).toThrow(
      'No active player for issueCommands complete step',
    );
  });
});
