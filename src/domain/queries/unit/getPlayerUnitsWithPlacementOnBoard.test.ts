import { createBoardWithUnits, createTestUnit, placed } from '@testing';
import { createEmptyGameState } from '@factories';
import { updateBoardState } from '@transforms';

import { getPlayerUnitsWithPlacementOnBoard } from './getPlayerUnitsWithPlacementOnBoard';
/**
 * GetPlayerUnitsWithPlacementOnBoard: all of a player's units on the board with coordinates and facings.
 */
describe('getPlayerUnitsWithPlacementOnBoard function', () => {
  it('returns each white unit with the coordinate it occupies', () => {
    const unit1 = createTestUnit('white', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 3 });

    const state = updateBoardState(
      createEmptyGameState('standard'),
      createBoardWithUnits([
        placed(unit1, 'E-5', 'north'),
        placed(unit2, 'F-5', 'south'),
        placed(unit3, 'G-5', 'east'),
      ]),
    );

    const whiteUnits = getPlayerUnitsWithPlacementOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(2);
    const whiteUnitsArray = [...whiteUnits];
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

  it('returns an empty set when the asked side has no unit on the board', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = updateBoardState(
      createEmptyGameState('standard'),
      createBoardWithUnits([placed(unit, 'E-5', 'north')]),
    );

    const blackUnits = getPlayerUnitsWithPlacementOnBoard(state, 'black');

    expect(blackUnits.size).toBe(0);
  });

  it('returns the coordinate and facing the unit was placed with', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = updateBoardState(
      createEmptyGameState('standard'),
      createBoardWithUnits([placed(unit, 'E-5', 'north')]),
    );

    const whiteUnits = getPlayerUnitsWithPlacementOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(1);
    const unitWithPlacement = [...whiteUnits][0];
    expect(unitWithPlacement?.unit).toBe(unit);
    expect(unitWithPlacement?.placement.coordinate).toBe('E-5');
    expect(unitWithPlacement?.placement.facing).toBe('north');
  });
});
