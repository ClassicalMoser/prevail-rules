import type { ResolveRallyEvent } from '@events';
import type { GameStateForVisibility } from '@game';
import { throwIfNone, throwIfPending } from '@utils';
import { CLEANUP_PHASE } from '@game';

import { createEmptyGameState, createTestCard } from '@testing';

import { applyResolveRallyEvent } from './applyResolveRallyEvent';

/**
 * Resolving a rally: the chosen card leaves `played`, the engine marks the per-player rally
 * slice `rallyResolved`, and stays on the resolve-rally step so units-broken can run next.
 * `unitsLostSupport` remains `'pending'` until {@link applyAssignUnitSupportEvent}.
 */
describe(applyResolveRallyEvent, () => {
  it('burns the played card, marks rally resolved, and leaves unitsLostSupport pending on the same step', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    const card = createTestCard();
    state.cardState.white.played = [card];

    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: 'pending',
        unitsLostSupport: 'pending',
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending',
      step: 'firstPlayerResolveRally',
    };

    const full = state;
    const event: ResolveRallyEvent = {
      card,
      effectType: 'resolveRally' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      player: 'white' as const,
    };

    const next = applyResolveRallyEvent(event, full);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== CLEANUP_PHASE) {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('firstPlayerResolveRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(rally.rallyResolved).toBe(true);
    expect(rally.unitsLostSupport).toBe('pending');
    expect(next.cardState.white.played).toStrictEqual([]);
  });

  it('on whiteSeen, resolves the white owned slice and leaves black hidden intact', () => {
    const base = createEmptyGameState();
    base.currentInitiative = 'white';
    const card = createTestCard();
    const whiteSeen: GameStateForVisibility<'whiteSeen'> = {
      ...base,
      cardState: {
        visibility: 'whiteSeen',
        white: {
          ...base.cardState.white,
          discarded: [],
          played: [card],
        },
        black: {
          awaitingPlay: 'hidden',
          burnt: [],
          discarded: [],
          inHand: ['hidden'],
          inPlay: null,
          played: [],
        },
      },
      currentRoundState: {
        ...base.currentRoundState,
        currentPhaseState: {
          firstPlayerRallyResolutionState: {
            completed: false,
            playerRallied: true,
            rallyResolved: false,
            routState: 'pending',
            unitsLostSupport: 'pending',
          },
          phase: CLEANUP_PHASE,
          secondPlayerRallyResolutionState: 'pending',
          step: 'firstPlayerResolveRally',
        },
      },
    };

    const event: ResolveRallyEvent = {
      card,
      effectType: 'resolveRally',
      eventNumber: 0,
      eventType: 'gameEffect',
      player: 'white',
    };

    const next = applyResolveRallyEvent(event, whiteSeen);

    expect(next.cardState.visibility).toBe('whiteSeen');
    expect(next.cardState.white.played).toStrictEqual([]);
    expect(next.cardState.black.awaitingPlay).toBe('hidden');
  });

  it('on whiteSeen, throws when the event player is black (unowned)', () => {
    const base = createEmptyGameState();
    base.currentInitiative = 'black';
    const card = createTestCard();
    const whiteSeen: GameStateForVisibility<'whiteSeen'> = {
      ...base,
      cardState: {
        visibility: 'whiteSeen',
        white: base.cardState.white,
        black: {
          awaitingPlay: 'hidden',
          burnt: [],
          discarded: [],
          inHand: ['hidden'],
          inPlay: null,
          played: [card],
        },
      },
      currentRoundState: {
        ...base.currentRoundState,
        currentPhaseState: {
          firstPlayerRallyResolutionState: {
            completed: false,
            playerRallied: true,
            rallyResolved: false,
            routState: 'pending',
            unitsLostSupport: 'pending',
          },
          phase: CLEANUP_PHASE,
          secondPlayerRallyResolutionState: 'pending',
          step: 'firstPlayerResolveRally',
        },
      },
    };

    const event: ResolveRallyEvent = {
      card,
      effectType: 'resolveRally',
      eventNumber: 0,
      eventType: 'gameEffect',
      player: 'black',
    };

    expect(() => applyResolveRallyEvent(event, whiteSeen)).toThrow(
      'Player black is not owned under whiteSeen visibility',
    );
  });
});
