import type { GameState, StandardBoard } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import { CLEANUP_PHASE } from '@entities';
import { getBoardSpace } from '@queries';
import { createEmptyGameState, createTestUnit } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';
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

  it('removes matching units from the board, adds rout state when penalty > 0, and stays on resolveRally step', () => {
    const base = createEmptyGameState();
    base.currentInitiative = 'white';
    const unit = createTestUnit('white', { attack: 3 });
    const withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, {
        unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      }),
    );

    const full: GameState<StandardBoard> = updatePhaseState(withBoard, {
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
    });

    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'resolveUnitsBroken' as const,
      player: 'white' as const,
      unitTypes: [unit.unitType],
    } satisfies ResolveUnitsBrokenEvent<StandardBoard>;

    const next = applyResolveUnitsBrokenEvent(event, full);

    const space = getBoardSpace(next.boardState, 'E-5');
    expect(space.unitPresence.presenceType).toBe('none');

    expect(next.routedUnits.has(unit)).toBe(true);

    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== CLEANUP_PHASE) throw new Error('cleanup');
    expect(phase.step).toBe('firstPlayerResolveRally');

    const rs = phase.firstPlayerRallyResolutionState;
    expect(rs?.unitsLostSupport?.has(unit)).toBe(true);
    expect(rs?.routState?.numberToDiscard).toBe(unit.unitType.routPenalty);
    expect(rs?.routState?.completed).toBe(false);
  });
});
