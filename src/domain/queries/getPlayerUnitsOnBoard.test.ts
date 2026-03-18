import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createEmptyGameState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getPlayerUnitsOnBoard } from './getPlayerUnitsOnBoard';

describe('getPlayerUnitsOnBoard', () => {
  it('should return all units for a player', () => {
    const unit1 = createTestUnit('white', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { unit: unit1, coordinate: 'E-5', facing: 'north' },
      { unit: unit2, coordinate: 'F-5', facing: 'south' },
      { unit: unit3, coordinate: 'G-5', facing: 'east' },
    ]);

    const whiteUnits = getPlayerUnitsOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(2);
    const whiteUnitsArray = [...whiteUnits];
    expect(whiteUnitsArray).toContain(unit1);
    expect(whiteUnitsArray).toContain(unit2);
    expect(whiteUnitsArray).not.toContain(unit3);
  });

  it('should return empty set when player has no units on board', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { unit, coordinate: 'E-5', facing: 'north' },
    ]);

    const blackUnits = getPlayerUnitsOnBoard(state, 'black');

    expect(blackUnits.size).toBe(0);
  });

  it('should include engaged units belonging to the player', () => {
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
        presenceType: 'single',
        unit: supportUnit,
        facing: 'south',
      },
    };

    const blackUnits = getPlayerUnitsOnBoard(state, 'black');

    expect(blackUnits.size).toBe(2);
    expect(blackUnits).toContain(blackUnit);
    expect(blackUnits).toContain(supportUnit);
    expect(blackUnits).not.toContain(whiteUnit);
  });

  it('should include an engaged secondary unit belonging to the player', () => {
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
