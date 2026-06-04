import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
  RESOLVE_MELEE_PHASE,
} from '@game';
import { createEmptyGameState } from '@testing/createEmptyGameState';

import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from './phaseStates';

/**
 * CreatePlayCardsPhaseState: Creates a PlayCardsPhaseState with sensible defaults.
 */
describe('createPlayCardsPhaseState function', () => {
  it('given context, returns play cards phase with default step', () => {
    expect.hasAssertions();
    const state = createPlayCardsPhaseState();
    expect(state.phase).toBe(PLAY_CARDS_PHASE);
    expect(state.step).toBe('chooseCards');
  });
});

describe('createMoveCommandersPhaseState function', () => {
  it('given context, returns move commanders phase with default step', () => {
    expect.hasAssertions();
    const state = createMoveCommandersPhaseState();
    expect(state.phase).toBe(MOVE_COMMANDERS_PHASE);
    expect(state.step).toBe('moveFirstCommander');
  });
});

describe('createIssueCommandsPhaseState function', () => {
  it('given context, returns issue commands phase with empty remaining sets', () => {
    expect.hasAssertions();
    const gameState = createEmptyGameState();
    const state = createIssueCommandsPhaseState(gameState);
    expect(state.phase).toBe(ISSUE_COMMANDS_PHASE);
    expect(state.step).toBe('firstPlayerResolveCommands');
    expect(state.remainingCommandsFirstPlayer.length).toBe(0);
    expect(state.currentCommandResolutionState).toBeUndefined();
  });
});

describe('createResolveMeleePhaseState function', () => {
  it('given context, returns resolve melee phase with melee resolution state', () => {
    expect.hasAssertions();
    const gameState = createEmptyGameState();
    const state = createResolveMeleePhaseState(gameState);
    expect(state.phase).toBe(RESOLVE_MELEE_PHASE);
    expect(state.step).toBe('resolveMelee');
    expect(state.currentMeleeResolutionState).toBeDefined();
    expect(state.remainingEngagements.length).toBe(0);
  });
});

describe('createCleanupPhaseState function', () => {
  it('given context, returns cleanup phase with default step', () => {
    expect.hasAssertions();
    const state = createCleanupPhaseState();
    expect(state.phase).toBe('cleanup');
    expect(state.step).toBe('discardPlayedCards');
    expect(state.firstPlayerRallyResolutionState).toBeUndefined();
  });
});
