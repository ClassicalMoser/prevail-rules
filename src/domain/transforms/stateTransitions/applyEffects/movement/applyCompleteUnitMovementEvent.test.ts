import type { GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteUnitMovementEvent } from './applyCompleteUnitMovementEvent';

/**
 * After path + engagement finish, completeUnitMovement clears CRS and either
 * waits for the next moveUnit or advances the issue-commands step.
 */
describe(applyCompleteUnitMovementEvent, () => {
  const event = {
    effectType: 'completeUnitMovement' as const,
    eventNumber: 0,
    eventType: 'gameEffect' as const,
  };

  it('clears CRS to pending when more units remain to resolve', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const leftover = createTestUnit('black', { attack: 2 });
    const movement = createMovementResolutionState(state);
    const full: GameState = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
        remainingUnitsFirstPlayer: [leftover],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteUnitMovementEvent(event, full);
    const phase = getIssueCommandsPhaseState(next);
    expect(phase.currentCommandResolutionState).toBe('pending');
    expect(phase.step).toBe('firstPlayerResolveCommands');
    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([leftover]);
  });

  it('advances to secondPlayerIssueCommands when first player has no remaining units', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const movement = createMovementResolutionState(state);
    const full: GameState = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
        remainingUnitsFirstPlayer: [],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteUnitMovementEvent(event, full);
    const phase = getIssueCommandsPhaseState(next);
    expect(phase.currentCommandResolutionState).toBe('pending');
    expect(phase.step).toBe('secondPlayerIssueCommands');
  });

  it('places the mover onto the target when it was held off-board for engagement', () => {
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'south',
      playerSide: 'white',
    });
    const mover = createTestUnit('black', { attack: 2 });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateBoardState(state, addUnitToBoard(state.boardState, defender));
    const movement = createMovementResolutionState(state, {
      movingUnit: {
        placement: { coordinate: 'E-6', facing: 'north' },
        unit: mover,
      },
      targetPlacement: { coordinate: 'E-6', facing: 'north' },
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
        remainingUnitsFirstPlayer: [],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteUnitMovementEvent(event, state);

    expect(next.boardState.board['E-6']?.unitPresence).toMatchObject({
      presenceType: 'engaged',
      primaryUnit: defender.unit,
      secondaryUnit: mover,
    });
  });
});
