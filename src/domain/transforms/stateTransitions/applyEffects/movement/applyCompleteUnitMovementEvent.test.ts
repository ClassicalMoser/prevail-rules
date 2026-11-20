import type { GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  createUnitWithPlacement,
  replaceBoard,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteUnitMovementEvent } from './applyCompleteUnitMovementEvent';

import { createEmptyGameState } from '@factories';
/**
 * After path + engagement finish, completeUnitMovement clears CRS and either
 * waits for the next moveUnit or advances the issue-commands step. The mover
 * already stands where its move ends; this sets nobody down.
 */
describe('applyCompleteUnitMovementEvent function', () => {
  const event = {
    effectType: 'completeUnitMovement' as const,
    eventType: 'gameEffect' as const,
  };

  /** A movement whose black mover has been set down on E-6, where it ends. */
  function arrivedAtE6(state: GameState) {
    const mover = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'black',
    });
    const movement = createMovementResolutionState(state, {
      movingUnit: mover,
      targetPlacement: mover.placement,
    });
    return movement;
  }

  it('clears CRS to pending when more units remain to resolve', () => {
    const state = createEmptyGameState('standard');
    const leftover = createTestUnit('black', { attack: 2 });
    const movement = arrivedAtE6(state);
    // The mover has been set down on E-6, where its move ends.
    const withMover = replaceBoard(
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

  it('leaves the step where it is when the last unit has moved, for the order to be completed next', () => {
    const state = createEmptyGameState('standard');
    const movement = arrivedAtE6(state);
    // The mover has been set down on E-6, where its move ends.
    const withMover = replaceBoard(
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

    // The unit's move is cleared. Ending the order is not this effect's to
    // decide: the expected engine sees no unit left and asks for
    // completeMovementCommand.
    expect(phase.currentCommandResolutionState).toBe('pending');
    expect(phase.step).toBe('firstPlayerResolveCommands');
  });

  it('throws when the mover has not been set down where its move ends', () => {
    // The move was written to E-6, but the movement still has the mover on
    // E-5, where it started.
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

    // The move itself, or the engagement, sets the mover down; finishing a
    // move that was never carried out would hide whatever skipped it.
    expect(() => applyCompleteUnitMovementEvent(event, full)).toThrow(
      'The mover has not been set down where its move ends',
    );
  });
});
