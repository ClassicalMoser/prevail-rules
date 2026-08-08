import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalMoveUnits } from './getLegalMoveUnits';

/**
 * GetLegalMoveUnits: atomic remaining units (with placements) when awaiting
 * moveUnit to start a movement command resolution.
 */
describe(getLegalMoveUnits, () => {
  function stateAwaitingMoveUnit(options?: { withUnitOnBoard?: boolean }) {
    const withUnitOnBoard = options?.withUnitOnBoard ?? true;
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    // Ensure movement command in play (factory default is movement, but be explicit).
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: tempCommandCards[0],
      },
    });
    if (withUnitOnBoard) {
      state = updateBoardState(
        state,
        addUnitToBoard(state.boardState, unitWithPlacement),
      );
    }
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [unitWithPlacement.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );
    return { state, unitWithPlacement };
  }

  it('returns the remaining unit with its board placement', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit();

    expect(getLegalMoveUnits(state)).toStrictEqual({
      player: 'black',
      units: [unitWithPlacement],
    });
  });

  it('returns null when not awaiting moveUnit', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalMoveUnits(state)).toBeNull();
  });

  it('returns null when the remaining unit is not on the board', () => {
    const { state } = stateAwaitingMoveUnit({ withUnitOnBoard: false });
    expect(getLegalMoveUnits(state)).toBeNull();
  });

  it('returns null when the in-play command is not movement', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: tempCommandCards[15],
      },
    });
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, unitWithPlacement),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [unitWithPlacement.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    expect(getLegalMoveUnits(state)).toBeNull();
  });
});
