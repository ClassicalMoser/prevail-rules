import type { RallyResolutionState } from '@game';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestUnit,
} from '@testing';

import {
  getCurrentRallyResolutionState,
  getRallyResolutionState,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRoutStateFromRally,
} from './rally';

/**
 * Cleanup rally helpers: map player or current resolve-rally step to the right rally slice,
 * and unwrap nested rout state for rally-driven rout effects.
 */
describe(getRallyResolutionState, () => {
  it('given black is first player at chooseRally, getRallyState(black) returns first bucket', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerChooseRally',
    });

    const result = getRallyResolutionState(state, 'black');
    expect(result.playerRallied).toBeTruthy();
  });

  it('given white is second player with second bucket set, getRallyState(white) returns it', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        completed: false,
        playerRallied: false,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      step: 'firstPlayerChooseRally',
    });

    const result = getRallyResolutionState(state, 'white');
    expect(result.playerRallied).toBeFalsy();
  });

  it('given both rally buckets undefined at chooseRally, getRallyState(black) throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerChooseRally',
    });

    expect(() => getRallyResolutionState(state, 'black')).toThrow(
      'No black rally resolution state found',
    );
  });
});

describe(getCurrentRallyResolutionState, () => {
  it('given step firstPlayerResolveRally with first bucket, returns that rally slice', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    });

    const result = getCurrentRallyResolutionState(state);
    expect(result.playerRallied).toBeTruthy();
  });

  it('given firstPlayerResolveRally but first bucket missing, throws', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'No first player rally resolution state found',
    );
  });

  it('given secondPlayerResolveRally with second bucket, returns that slice', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      step: 'secondPlayerResolveRally',
    });

    const result = getCurrentRallyResolutionState(state);
    expect(result.playerRallied).toBeTruthy();
  });

  it('given secondPlayerResolveRally but second bucket missing, throws', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
      step: 'secondPlayerResolveRally',
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'No second player rally resolution state found',
    );
  });

  it('given cleanup discardPlayedCards step, getCurrentRally throws not resolveRally step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
      step: 'discardPlayedCards',
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'Not in a resolveRally step',
    );
  });
});

describe(getRoutStateFromRally, () => {
  it('given rally slice with rout nested, returns that rout object', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const rallyState: RallyResolutionState = {
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: {
        cardsChosen: false,
        completed: false,
        numberToDiscard: 1,
        player: 'black' as const,
        substepType: 'rout' as const,
        unitsToRout: new Set([unit]),
      },
      unitsLostSupport: new Set(),
    };

    const result = getRoutStateFromRally(rallyState);
    expect(result.substepType).toBe('rout');
    expect(result.player).toBe('black');
  });

  it('given rally slice without routState, throws no rout in rally resolution', () => {
    const rallyState: RallyResolutionState = {
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: undefined,
      unitsLostSupport: new Set(),
    };

    expect(() => getRoutStateFromRally(rallyState)).toThrow(
      'No rout state found in rally resolution state',
    );
  });
});

describe(getRoutStateFromCleanupPhaseForResolveRout, () => {
  it('returns rout from first player rally on firstPlayerResolveRally', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: true,
        routState: {
          cardsChosen: false,
          completed: false,
          numberToDiscard: undefined,
          player: 'white',
          substepType: 'rout',
          unitsToRout: new Set([unit]),
        },
        unitsLostSupport: new Set(),
      },
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    });

    const rout = getRoutStateFromCleanupPhaseForResolveRout(state);
    expect(rout.unitsToRout.has(unit)).toBeTruthy();
  });

  it('returns rout from second player rally on secondPlayerResolveRally', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: true,
        routState: {
          cardsChosen: false,
          completed: false,
          numberToDiscard: undefined,
          player: 'black',
          substepType: 'rout',
          unitsToRout: new Set([unit]),
        },
        unitsLostSupport: new Set(),
      },
      step: 'secondPlayerResolveRally',
    });

    const rout = getRoutStateFromCleanupPhaseForResolveRout(state);
    expect(rout.unitsToRout.has(unit)).toBeTruthy();
  });

  it('throws when rally bucket has no rout state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: true,
        routState: undefined,
        unitsLostSupport: new Set(),
      },
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    });

    expect(() => getRoutStateFromCleanupPhaseForResolveRout(state)).toThrow(
      'No rout state found in rally resolution',
    );
  });
});
