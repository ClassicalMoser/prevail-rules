import type { StandardBoard } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import type { StandardGameState } from '@game';
import { CLEANUP_PHASE } from '@game';

import { getBoardSpace } from '@queries';
import { createEmptyGameState, createTestUnit } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyResolveUnitsBrokenEvent } from './applyResolveUnitsBrokenEvent';

/**
 * After listing unsupported types, this effect removes those units from the board, may seed a
 * rout substep when `routPenalty` is positive, and either advances cleanup or stays resolving.
 */
describe('applyResolveUnitsBrokenEvent', () => {
  it('given empty unitTypes list, unitsLostSupport empty set and step advances to second choose rally', () => {
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

    const full = state as StandardGameState;
    const event = {
      eventNumber: 0,
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

  it('given white unit on E-5 with positive routPenalty type, unit removed routedUnits set routState seeded same step', () => {
    const base = createEmptyGameState();
    base.currentInitiative = 'white';
    const unit = createTestUnit('white', { attack: 3 });
    const withBoard = updateBoardState(
      base,
      addUnitToBoard(base.boardState, {
        boardType: 'standard' as const,
        unit,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'south',
        },
      }),
    );

    const full: StandardGameState = updatePhaseState(withBoard, {
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
      eventNumber: 0,
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
