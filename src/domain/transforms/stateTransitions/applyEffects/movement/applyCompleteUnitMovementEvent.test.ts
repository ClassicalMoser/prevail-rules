import type { GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteUnitMovementEvent } from './applyCompleteUnitMovementEvent';

import { createEmptyGameState } from '@factories';
/**
 * After path + engagement finish, completeUnitMovement clears CRS and either
 * waits for the next moveUnit or advances the issue-commands step.
 */
describe('applyCompleteUnitMovementEvent function', () => {
  const event = {
    effectType: 'completeUnitMovement' as const,
    eventType: 'gameEffect' as const,
  };

  it('clears CRS to pending when more units remain to resolve', () => {
    const state = createEmptyGameState('standard');
    const leftover = createTestUnit('black', { attack: 2 });
    const movement = createMovementResolutionState(state);
    // The mover stands where it started, E-5, and goes to E-6.
    const withMover = updateBoardState(
      state,
      addUnitToBoard(state.boardState, movement.movingUnit),
    );
    const full: GameState = updatePhaseState(
      withMover,
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
    // The mover stands where it started, E-5, and goes to E-6.
    const withMover = updateBoardState(
      state,
      addUnitToBoard(state.boardState, movement.movingUnit),
    );
    const full: GameState = updatePhaseState(
      withMover,
      createIssueCommandsPhaseState(withMover, {
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

  it('throws when the mover is nowhere on the board, since there is no unit to finish the move', () => {
    // The move was written to E-6, but the mover stands on no space at all.
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

    // A move finishes the unit that made it; setting one down from nowhere
    // would hide whatever took it off the board.
    expect(() => applyCompleteUnitMovementEvent(event, full)).toThrow(
      'The moving unit is not on the board',
    );
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

    // The front engagement is settled and the mover is placed on the defender.
    const next = applyCompleteUnitMovementEvent(event, state);

    // The commander has left E-5 with its unit and stands in the engaged
    // space, committed to the fight.
    expect(next.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(next.boardState.board['D-5']?.commanders).toStrictEqual(['black']);
  });
});
