import type { GameState } from '@game';
import { createEmptyGameState, createMoveCommanderEvent } from '@factories';
import {
  getBoardSpace,
  getCommanderSpace,
  getMoveCommandersPhaseState,
} from '@queries';
import {
  createBoardWithCommander,
  createMoveCommandersPhaseState,
  replaceBoard,
  withLostCommander,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyMoveCommanderEvent } from './applyMoveCommanderEvent';

/**
 * Move-commanders phase: each side relocates their commander token on the board; after the
 * second move the step becomes `complete`.
 */
describe('applyMoveCommanderEvent function', () => {
  /**
   * Phase 2 on the given turn. Black holds the initiative, so black moves
   * first and white second (§4.2.1); black's commander stands on E-5 and
   * white's on E-6.
   */
  function createGameStateInMoveCommandersStep(
    step: 'moveFirstCommander' | 'moveSecondCommander',
  ): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );

    // Both commanders on the board.
    const blackPlaced = createBoardWithCommander('black', 'E-5');
    const bothPlaced = createBoardWithCommander('white', 'E-6', blackPlaced);
    const stateWithBoard = replaceBoard(state, bothPlaced);

    // Phase 2, on the turn the spec asks for.
    const stateWithPhase = updatePhaseState(
      stateWithBoard,
      createMoveCommandersPhaseState({ step }),
    );
    return stateWithPhase;
  }

  it("moves the first player's commander, and passes the turn to the second player", () => {
    const state = createGameStateInMoveCommandersStep('moveFirstCommander');

    // Black moves two spaces, well within its four (§4.2.2).
    const newState = applyMoveCommanderEvent(
      createMoveCommanderEvent({ player: 'black', to: 'E-7' }),
      state,
    );

    // Black's commander has left E-5 for E-7…
    expect(getCommanderSpace('black', newState)).toBe('E-7');
    expect(getBoardSpace(newState.boardState, 'E-5').commanders).toStrictEqual(
      [],
    );
    // …white's has not moved…
    expect(getCommanderSpace('white', newState)).toBe('E-6');
    // …and it is white's turn (§4.2.1).
    expect(getMoveCommandersPhaseState(newState).step).toBe(
      'moveSecondCommander',
    );
  });

  it("moves the second player's commander, and ends the phase", () => {
    const state = createGameStateInMoveCommandersStep('moveSecondCommander');

    // White moves two spaces.
    const newState = applyMoveCommanderEvent(
      createMoveCommanderEvent({ player: 'white', to: 'E-8' }),
      state,
    );

    // White's commander has left E-6 for E-8, black's has not moved…
    expect(getCommanderSpace('white', newState)).toBe('E-8');
    expect(getBoardSpace(newState.boardState, 'E-6').commanders).toStrictEqual(
      [],
    );
    expect(getCommanderSpace('black', newState)).toBe('E-5');
    // …and both turns are taken, so Phase 2 is done.
    expect(getMoveCommandersPhaseState(newState).step).toBe('complete');
  });

  it('when the second player’s commander has fallen, the first player’s move still passes to the second player’s turn', () => {
    // White's commander was defeated earlier (§4.2.8): white has no turn.
    const base = createGameStateInMoveCommandersStep('moveFirstCommander');
    const state = withLostCommander(base, 'white');

    // Black, the first player, moves its commander.
    const newState = applyMoveCommanderEvent(
      createMoveCommanderEvent({
        player: 'black',
        to: 'E-7',
      }),
      state,
    );

    // White's turn comes next as always; passing it over is
    // skipLostCommanderMove's, which the expected engine asks for.
    expect(getMoveCommandersPhaseState(newState).step).toBe(
      'moveSecondCommander',
    );
  });

  it('leaves the state it was given unchanged', () => {
    const state = createGameStateInMoveCommandersStep('moveFirstCommander');

    applyMoveCommanderEvent(
      createMoveCommanderEvent({ player: 'black', to: 'E-7' }),
      state,
    );

    // The original still has black's commander on E-5, on black's turn.
    expect(getCommanderSpace('black', state)).toBe('E-5');
    expect(getMoveCommandersPhaseState(state).step).toBe('moveFirstCommander');
  });
});
