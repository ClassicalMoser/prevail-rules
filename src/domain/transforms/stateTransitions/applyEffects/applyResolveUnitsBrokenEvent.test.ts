import type { GameState, StandardBoard } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { applyResolveUnitsBrokenEvent } from './applyResolveUnitsBrokenEvent';

describe('applyResolveUnitsBrokenEvent', () => {
  it('records empty broken set and advances when no rout penalty', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';

    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: true,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    };

    const full = state as GameState<StandardBoard>;
    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'resolveUnitsBroken' as const,
      player: 'white' as const,
      unitTypes: [],
    } satisfies ResolveUnitsBrokenEvent<StandardBoard>;

    const next = applyResolveUnitsBrokenEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== CLEANUP_PHASE) throw new Error('cleanup');
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rs = phase.firstPlayerRallyResolutionState;
    expect(rs?.unitsLostSupport).toEqual(new Set());
    expect(rs?.routState).toBeUndefined();
  });
});
