import {
  createBoardWithUnits,
  createEmptyGameState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getPlayerUnitsWithPlacementOnBoard } from './getPlayerUnitsWithPlacementOnBoard';

describe('getPlayerUnitsWithPlacementOnBoard', () => {
  it('should return all units with placement for a player', () => {
    const unit1 = createTestUnit('white', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { unit: unit1, coordinate: 'E-5', facing: 'north' },
      { unit: unit2, coordinate: 'F-5', facing: 'south' },
      { unit: unit3, coordinate: 'G-5', facing: 'east' },
    ]);

    const whiteUnits = getPlayerUnitsWithPlacementOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(2);
    const whiteUnitsArray = Array.from(whiteUnits);
    expect(
      whiteUnitsArray.some(
        (u) => u.unit === unit1 && u.placement.coordinate === 'E-5',
      ),
    ).toBe(true);
    expect(
      whiteUnitsArray.some(
        (u) => u.unit === unit2 && u.placement.coordinate === 'F-5',
      ),
    ).toBe(true);
  });

  it('should return empty set when player has no units on board', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { unit, coordinate: 'E-5', facing: 'north' },
    ]);

    const blackUnits = getPlayerUnitsWithPlacementOnBoard(state, 'black');

    expect(blackUnits.size).toBe(0);
  });

  it('should include placement information', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = createEmptyGameState();
    state.boardState = createBoardWithUnits([
      { unit, coordinate: 'E-5', facing: 'north' },
    ]);

    const whiteUnits = getPlayerUnitsWithPlacementOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(1);
    const unitWithPlacement = Array.from(whiteUnits)[0];
    expect(unitWithPlacement?.unit).toBe(unit);
    expect(unitWithPlacement?.placement.coordinate).toBe('E-5');
    expect(unitWithPlacement?.placement.facing).toBe('north');
  });
});
