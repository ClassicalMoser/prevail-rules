import { tempCommandCards } from '@sampleValues';
import type { GameState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { getIssueCommandsPhaseState } from '@queries';
import {
  createBoardWithFacingRow,
  createBoardWithUnits,
  createTestUnit,
  placed,
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
    // Black, issuing first, orders two of its units on the board.
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const state = replaceBoard(
      issuingOn('firstPlayerIssueCommands'),
      createBoardWithUnits([
        placed(unit1, 'E-5', 'north'),
        placed(unit2, 'E-6', 'north'),
      ]),
    );

    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unit1, unit2] },
        player: 'black',
      }),
      state,
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

  it('orders the unit the board holds, not the copy the order names', () => {
    // Black's archer stands at E-5 with Range 2.
    const archer = createTestUnit('black', { range: 2 });
    const state = replaceBoard(
      issuingOn('firstPlayerIssueCommands'),
      createBoardWithUnits([placed(archer, 'E-5', 'north')]),
    );

    // The order names the same unit, who it is, but claims Range 9.
    const claimed = {
      ...archer,
      unitType: {
        ...archer.unitType,
        stats: { ...archer.unitType.stats, range: 9 },
      },
    };
    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [claimed] },
        player: 'black',
      }),
      state,
    );

    // The unit ordered, and left to carry out its order, is the board's:
    // a Shoot order would read its reach from there.
    expect(issued.currentRoundState.commandedUnits).toStrictEqual([archer]);
    expect(
      getIssueCommandsPhaseState(issued).remainingUnitsFirstPlayer,
    ).toStrictEqual([archer]);
  });

  it('moves the second player on to carrying out their own orders', () => {
    // Black has finished; White issues second, ordering its one unit.
    const unit = createTestUnit('white', { attack: 3 });
    const state = replaceBoard(
      issuingOn('secondPlayerIssueCommands'),
      createBoardWithUnits([placed(unit, 'E-5', 'south')]),
    );

    const issued = applyIssueCommandsEvent(
      createIssueCommandsEvent({
        allocation: { allocationType: 'units', units: [unit] },
        player: 'white',
      }),
      state,
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
    // Black orders its one unit from a state it does not own.
    const unit = createTestUnit('black', { attack: 3 });
    const state = replaceBoard(
      issuingOn('firstPlayerIssueCommands'),
      createBoardWithUnits([placed(unit, 'E-5', 'north')]),
    );

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
