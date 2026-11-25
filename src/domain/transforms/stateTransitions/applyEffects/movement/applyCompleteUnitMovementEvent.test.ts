import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { GameState, MovementResolutionState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteUnitMovementEvent } from './applyCompleteUnitMovementEvent';

/**
 * After path + engagement finish, completeUnitMovement clears CRS and either
 * waits for the next moveUnit or advances the issue-commands step. The mover
 * already stands where its move ends; this sets nobody down.
 * TODO(misleading): this effect never advances the step; the expected engine
 * asks for completeMovementCommand for that, as the second case shows.
 * Settle by saying it only clears the unit's move, whatever is left.
 */
describe('applyCompleteUnitMovementEvent function', () => {
  const event = {
    effectType: 'completeUnitMovement' as const,
    eventType: 'gameEffect' as const,
  };

  /** Black's unit carrying out its move. */
  const mover = createTestUnit('black', { attack: 2 });

  /**
   * Black holds the initiative and carries out its Move order: `mover`'s
   * move is under way, written to end on E-6 facing north unless the case
   * says otherwise, and the units listed are still to move after it.
   */
  function resolvingMove(
    board: UnitWithPlacement[],
    remaining: UnitInstance[] = [],
    movement: Partial<MovementResolutionState> = {},
  ): GameState {
    const base = updateCurrentInitiative(
      createGameStateWithUnits(board),
      'black',
    );
    const move = createMovementResolutionState(base, {
      movingUnit: mover,
      targetPlacement: { coordinate: 'E-6', facing: 'north' },
      ...movement,
    });
    const resolving = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        currentCommandResolutionState: move,
        remainingUnitsFirstPlayer: remaining,
        step: 'firstPlayerResolveCommands',
      }),
    );
    return resolving;
  }

  it('ends the unit’s move and keeps the units still to move after it', () => {
    // The mover has been set down on E-6, where its move ends; another of
    // Black's units on E-8 is still to move.
    const waiting = createTestUnit('black', { attack: 3 });
    const state = resolvingMove(
      [placed(mover, 'E-6', 'north'), placed(waiting, 'E-8', 'north')],
      [waiting],
    );

    const next = applyCompleteUnitMovementEvent(event, state);

    // No move is under way, Black is still carrying out its order, and the
    // waiting unit may move next (§4.3.9).
    expect(getIssueCommandsPhaseState(next)).toMatchObject({
      currentCommandResolutionState: 'pending',
      remainingUnitsFirstPlayer: [waiting],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('leaves the step where it is when the last unit has moved, for the order to be completed next', () => {
    // The mover has been set down on E-6, where its move ends.
    const state = resolvingMove([placed(mover, 'E-6', 'north')]);

    const next = applyCompleteUnitMovementEvent(event, state);
    const phase = getIssueCommandsPhaseState(next);

    // The unit's move is cleared. Ending the order is not this effect's to
    // decide: the expected engine sees no unit left and asks for
    // completeMovementCommand.
    expect(phase.currentCommandResolutionState).toBe('pending');
    expect(phase.step).toBe('firstPlayerResolveCommands');
  });

  it('throws when the mover has not been set down where its move ends', () => {
    // The move was written to E-6, but the mover still stands on E-5,
    // where it started.
    const state = resolvingMove([placed(mover, 'E-5', 'north')]);

    // The move itself, or the engagement, sets the mover down; finishing a
    // move that was never carried out would hide whatever skipped it.
    expect(() => applyCompleteUnitMovementEvent(event, state)).toThrow(
      'The mover has not been set down where its move ends',
    );
  });

  it('throws when the mover stands on the space its move ends on, facing another way', () => {
    // The move was written to end on E-6 facing north; the mover is on E-6
    // but faces north-east, so it is not where its move put it (§2.3).
    const state = resolvingMove([placed(mover, 'E-6', 'northEast')]);

    expect(() => applyCompleteUnitMovementEvent(event, state)).toThrow(
      'The mover has not been set down where its move ends',
    );
  });

  it('throws when the move has not been written yet', () => {
    // The mover has been chosen and stands on E-5, but no move is written:
    // the player has yet to send it (§4.3.10 step 3).
    const state = resolvingMove([placed(mover, 'E-5', 'north')], [], {
      targetPlacement: 'pending',
    });

    // Finishing a move that has no end yet is a fault in the sequence.
    expect(() => applyCompleteUnitMovementEvent(event, state)).toThrow(
      'The move has not been written yet',
    );
  });
});
