import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createEmptyGameState,
  createTestUnit,
} from '@testing';

import { getPlayerUnitsOnBoard } from './getPlayerUnitsOnBoard';

/**
 * GetPlayerUnitsOnBoard: set of unit instances for a player present on the board (including engaged).
 */
describe(getPlayerUnitsOnBoard, () => {
  it('given a player, returns all units', () => {
    const unit1 = createTestUnit('white', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { coordinate: 'E-5', facing: 'north', unit: unit1 },
      { coordinate: 'F-5', facing: 'south', unit: unit2 },
      { coordinate: 'G-5', facing: 'east', unit: unit3 },
    ]);

    const whiteUnits = getPlayerUnitsOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(2);
    const whiteUnitsArray = [...whiteUnits];
    expect(whiteUnitsArray).toContain(unit1);
    expect(whiteUnitsArray).toContain(unit2);
    expect(whiteUnitsArray).not.toContain(unit3);
  });

  it('given player has no units on board, returns empty set', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { coordinate: 'E-5', facing: 'north', unit },
    ]);

    const blackUnits = getPlayerUnitsOnBoard(state, 'black');

    expect(blackUnits.size).toBe(0);
  });

  it('given include engaged units belonging to the player', () => {
    const blackUnit = createTestUnit('black', { attack: 3 });
    const whiteUnit = createTestUnit('white', { attack: 3 });
    const supportUnit = createTestUnit('black', { attack: 3 });
    const state = createEmptyGameState();
    state.boardState = createBoardWithEngagedUnits(
      blackUnit,
      whiteUnit,
      'E-5',
      'north',
    );
    state.boardState.board['F-5'] = {
      ...state.boardState.board['F-5'],
      unitPresence: {
        facing: 'south',
        presenceType: 'single',
        unit: supportUnit,
      },
    };

    const blackUnits = getPlayerUnitsOnBoard(state, 'black');

    expect(blackUnits.size).toBe(2);
    expect(blackUnits).toContain(blackUnit);
    expect(blackUnits).toContain(supportUnit);
    expect(blackUnits).not.toContain(whiteUnit);
  });

  it('given include an engaged secondary unit belonging to the player', () => {
    const blackUnit = createTestUnit('black', { attack: 3 });
    const whiteUnit = createTestUnit('white', { attack: 3 });
    const state = createEmptyGameState();
    state.boardState = createBoardWithEngagedUnits(
      blackUnit,
      whiteUnit,
      'E-5',
      'north',
    );

    const whiteUnits = getPlayerUnitsOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(1);
    expect(whiteUnits).toContain(whiteUnit);
    expect(whiteUnits).not.toContain(blackUnit);
  });
});
