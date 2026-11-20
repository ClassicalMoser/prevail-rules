import { createGameStateWithBoard } from '@testing';
import { createEmptyGameState } from '@factories';
import { addCommanderToBoard } from '@transforms';

import { getCommanderSpace } from './getCommanderSpace';

describe('getCommanderSpace function', () => {
  it('gives the space a side’s commander stands on', () => {
    // White's commander stands at E-5.
    const board = addCommanderToBoard(
      createEmptyGameState('standard').boardState,
      'white',
      'E-5',
    );

    expect(getCommanderSpace('white', createGameStateWithBoard(board))).toBe(
      'E-5',
    );
  });

  it('throws when the side’s commander is not on the board', () => {
    // Only White's commander is placed; Black's is nowhere.
    const board = addCommanderToBoard(
      createEmptyGameState('standard').boardState,
      'white',
      'E-5',
    );

    expect(() =>
      getCommanderSpace('black', createGameStateWithBoard(board)),
    ).toThrow('The black commander is not on the board');
  });
});
