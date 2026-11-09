import type { GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  createUnitWithPlacement,
  placed,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteUnitMovementEvent } from './applyCompleteUnitMovementEvent';

import { createEmptyGameState, createUnitPlacement } from '@factories';
/**
 * After path + engagement finish, completeUnitMovement clears CRS and either
 * waits for the next moveUnit or advances the issue-commands step.
 */
describe('applyCompleteUnitMovementEvent function', () => {
  const event = {
    effectType: 'completeUnitMovement' as const,
    eventNumber: 0,
    eventType: 'gameEffect' as const,
  };

  it('clears CRS to pending when more units remain to resolve', () => {
    const state = createEmptyGameState('standard');
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
    const state = createEmptyGameState('standard');
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
    let state = createEmptyGameState('standard');
    state = updateBoardState(state, addUnitToBoard(state.boardState, defender));
    const movement = createMovementResolutionState(state, {
      movingUnit: placed(mover, 'E-6', 'north'),
      targetPlacement: createUnitPlacement('E-6', 'north'),
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

  it('moves a unit that is still on its starting hex onto the enemy target', () => {
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    const mover = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { attack: 2 },
    });
    let state = createEmptyGameState('standard');
    state = updateBoardState(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, mover), defender),
    );
    const movement = createMovementResolutionState(state, {
      movingUnit: mover,
      targetPlacement: { coordinate: 'D-5', facing: 'north' },
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

    expect(next.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(next.boardState.board['D-5']?.unitPresence).toMatchObject({
      presenceType: 'engaged',
      primaryUnit: defender.unit,
      secondaryUnit: mover.unit,
    });
  });

  it('a commander riding into an engagement joins the fight with the unit', () => {
    // §4.3.10: the one way a commander comes to share an enemy's space.
    // Black's commander rides with the mover from E-5 into white on D-5.
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    const mover = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
    state = updateBoardState(
      state,
      addCommanderToBoard(
        addUnitToBoard(addUnitToBoard(state.boardState, mover), defender),
        'black',
        'E-5',
      ),
    );
    const movement = createMovementResolutionState(state, {
      moveCommander: true,
      movingUnit: mover,
      targetPlacement: { coordinate: 'D-5', facing: 'north' },
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

    expect(next.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(next.boardState.board['D-5']?.commanders).toStrictEqual(['black']);
  });
});
