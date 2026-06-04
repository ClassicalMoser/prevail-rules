import type { StandardBoard } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import type { GameStateForBoard } from '@game';
import { CLEANUP_PHASE } from '@game';

import { getBoardSpace } from '@queries';
import { createEmptyGameState, createTestUnit } from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyResolveUnitsBrokenEvent } from './applyResolveUnitsBrokenEvent';

/**
 * After listing unsupported types, this effect removes those units from the board, may seed a
 * rout substep when `routPenalty` is positive, and either advances cleanup or stays resolving.
 */
describe(applyResolveUnitsBrokenEvent, () => {
  it('given empty unitTypes list, unitsLostSupport empty set and step advances to second choose rally', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';

    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: true,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    };

    const full = state;
    const event: ResolveUnitsBrokenEvent = {
      effectType: 'resolveUnitsBroken' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      player: 'white' as const,
      unitTypes: [],
    };

    const next = applyResolveUnitsBrokenEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== CLEANUP_PHASE) {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rs = phase.firstPlayerRallyResolutionState;
    expect(rs?.unitsLostSupport).toStrictEqual([]);
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
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'south',
        },
        unit,
      }),
    );

    const full: GameStateForBoard<StandardBoard> = updatePhaseState(withBoard, {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: true,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    });

    const event: ResolveUnitsBrokenEvent = {
      effectType: 'resolveUnitsBroken' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      player: 'white' as const,
      unitTypes: [unit.unitType],
    };

    const next = applyResolveUnitsBrokenEvent(event, full);

    const space = getBoardSpace(next.boardState, 'E-5');
    expect(space.unitPresence.presenceType).toBe('none');

    expect(next.routedUnits.includes(unit)).toBeTruthy();

    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== CLEANUP_PHASE) {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('firstPlayerResolveRally');

    const rs = phase.firstPlayerRallyResolutionState;
    expect(rs?.unitsLostSupport?.includes(unit)).toBeTruthy();
    expect(rs?.routState?.numberToDiscard).toBe(unit.unitType.routPenalty);
    expect(rs?.routState?.completed).toBeFalsy();
  });
});
