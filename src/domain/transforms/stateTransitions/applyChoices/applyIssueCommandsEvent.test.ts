import { tempCommandCards } from '@sampleValues';
import type { GameState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { getIssueCommandsPhaseState } from '@queries';
import {
  createBoardWithFacingRow,
  createTestUnit,
  replaceBoard,
  updateCardState,
} from '@testing';

import { updatePhaseState } from '@transforms/pureTransforms';

import { applyIssueCommandsEvent } from './applyIssueCommandsEvent';

import { createEmptyGameState, createIssueCommandsEvent } from '@factories';
import { updateCurrentInitiative } from '@transforms/pureTransforms/state/updateCurrentInitiative';
/**
 * Issuing orders (§4.3): the player's whole allocation of their card's
 * command at once. Every unit it orders is ordered for the round, and the
 * player moves straight on to carrying the orders out; whatever the
 * allocation left unissued is forfeited.
 */
describe('applyIssueCommandsEvent function', () => {
  /** Black holds the initiative; both cards are in play; on this issuing step. */
  function issuingOn(
    step: 'firstPlayerIssueCommands' | 'secondPlayerIssueCommands',
  ): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withCards = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
      white: { ...state.cardState.white, inPlay: tempCommandCards[1] },
    });
    const issuing = updatePhaseState(withCards, {
      currentCommandResolutionState: 'pending',
      phase: ISSUE_COMMANDS_PHASE,
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step,
    });
    return issuing;
  }

  it('orders the units of a units order, and moves on to carrying them out', () => {
    // Black, issuing first, orders two units.
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });

    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unit1, unit2] },
        player: 'black',
      }),
      issuingOn('firstPlayerIssueCommands'),
    );

    // Both are ordered for the round (§4.3.6)…
    expect(issued.currentRoundState.commandedUnits).toStrictEqual([
      unit1,
      unit2,
    ]);
    // …and Black carries them out next, with no further issuing.
    expect(getIssueCommandsPhaseState(issued)).toMatchObject({
      remainingUnitsFirstPlayer: [unit1, unit2],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('orders every unit of every line in a lines order', () => {
    // Black's rank of four, E-1 to E-4, facing north.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3', 'E-4'],
    });
    const state = replaceBoard(issuingOn('firstPlayerIssueCommands'), board);

    // Black orders two lines: E-3 to E-1, listed from E-3, and E-4 alone.
    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: {
          allocationType: 'lines',
          lines: [
            [unitAt('E-3').unit, unitAt('E-2').unit, unitAt('E-1').unit],
            [unitAt('E-4').unit],
          ],
        },
        player: 'black',
      }),
      state,
    );

    // Every unit of both lines is ordered, as listed.
    expect(issued.currentRoundState.commandedUnits).toStrictEqual([
      unitAt('E-3').unit,
      unitAt('E-2').unit,
      unitAt('E-1').unit,
      unitAt('E-4').unit,
    ]);
  });

  it('moves the second player on to carrying out their own orders', () => {
    // Black has finished; White issues second, ordering one unit.
    const unit = createTestUnit('white', { attack: 3 });

    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unit] },
        player: 'white',
      }),
      issuingOn('secondPlayerIssueCommands'),
    );

    // White's unit is White's to carry out, on White's resolve step.
    expect(getIssueCommandsPhaseState(issued)).toMatchObject({
      remainingUnitsSecondPlayer: [unit],
      step: 'secondPlayerResolveCommands',
    });
  });

  it('declines with an allocation that orders nobody, and carries out nothing', () => {
    // Black orders no unit at all (§4.3.2).
    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [] },
        player: 'black',
      }),
      issuingOn('firstPlayerIssueCommands'),
    );

    // Nobody is ordered, and Black has nothing to carry out.
    expect(issued.currentRoundState.commandedUnits).toStrictEqual([]);
    expect(getIssueCommandsPhaseState(issued)).toMatchObject({
      remainingUnitsFirstPlayer: [],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('leaves the state it was given unchanged', () => {
    // Black orders one unit from a state it does not own.
    const state = issuingOn('firstPlayerIssueCommands');
    const unit = createTestUnit('black', { attack: 3 });

    applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unit] },
        player: 'black',
      }),
      state,
    );

    // The original still stands on Black's issuing step, nobody ordered.
    expect(state.currentRoundState.commandedUnits).toStrictEqual([]);
    expect(getIssueCommandsPhaseState(state).step).toBe(
      'firstPlayerIssueCommands',
    );
  });
});
