import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { createUnitWithPlacement } from '@testing';
import { addCommanderToBoard } from '../commanders/addCommanderToBoard';
import { addUnitToBoard } from '../units/addUnitToBoard';

import { updateBoardState } from './updateBoardState';

/**
 * UpdateBoardState: Creates a new game state with the board state updated.
 */
describe('updateBoardState function', () => {
  it('given update the board state', () => {
    const state = createEmptyGameState('standard');
    const newBoard = state.boardState; // Same board for simplicity

    const newState = updateBoardState(state, newBoard);

    expect(newState.boardState).toBe(newBoard);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState('standard');
    const originalBoardState = state.boardState;
    const newBoard = state.boardState;

    updateBoardState(state, newBoard);

    expect(state.boardState).toBe(originalBoardState);
  });

  it('given a board with a unit and a commander, files both where they stand', () => {
    // White's unit at E-5 and white's commander at E-6.
    const state = createEmptyGameState('standard');
    const standing = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'white',
    });
    const board = addCommanderToBoard(
      addUnitToBoard(state.boardState, standing),
      'white',
      'E-6',
    );

    const newState = updateBoardState(state, board);

    // The index, set afresh from the new board, finds each by name.
    expect(newState.index.units[createUnitIndexKey(standing.unit)]).toBe('E-5');
    expect(newState.index.commanders.white).toBe('E-6');
  });
});
