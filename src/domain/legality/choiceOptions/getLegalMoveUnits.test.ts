import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalMoveUnits } from './getLegalMoveUnits';

import { createEmptyGameState } from '@factories';

/** Default createTestCard command type is movement. */
const movementCard = createTestCard();
/** In-play command that is not movement. */
const rangedCard = {
  ...createTestCard(),
  command: createTestCommand({ type: 'rangedAttack' }),
};
/**
 * GetLegalMoveUnits: atomic remaining units (with placements) when awaiting
 * moveUnit to start a movement command resolution.
 */
describe('getLegalMoveUnits function', () => {
  function stateAwaitingMoveUnit(options?: { withUnitOnBoard?: boolean }) {
    const withUnitOnBoard = options?.withUnitOnBoard ?? true;
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
    // Ensure movement command in play (factory default is movement, but be explicit).
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: movementCard,
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

  it('throws when asked outside the issue commands phase, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(() => getLegalMoveUnits(state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });

  it('answers that nobody can move when the remaining unit is not on the board', () => {
    // The commanded unit routed earlier and no longer stands anywhere.
    const { state } = stateAwaitingMoveUnit({ withUnitOnBoard: false });

    // That is a real answer, not a mistake: the order ends with no move made.
    expect(getLegalMoveUnits(state)).toStrictEqual({
      player: 'black',
      units: [],
    });
  });

  it('throws when the card in play is not a movement order', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: rangedCard,
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

    expect(() => getLegalMoveUnits(state)).toThrow(
      'The card black has in play is not a movement order',
    );
  });
});
