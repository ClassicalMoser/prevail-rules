import { createEmptyGameState } from '@factories';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
  replaceBoard,
  withReservedUnits,
} from '@testing';

import { findUnitWithPlacementOnBoard } from './findUnitWithPlacementOnBoard';

/**
 * An event names a unit by who it is; the board holds what it is and where it
 * stands. This answers both, or nothing for a unit that is not on the board.
 */
describe('findUnitWithPlacementOnBoard function', () => {
  // White's archer at E-5 facing north, as the board holds it: Range 2.
  const archer = createTestUnit('white', { range: 2 });
  const state = replaceBoard(
    createEmptyGameState('standard'),
    createBoardWithUnits([placed(archer, 'E-5', 'north')]),
  );

  it('answers the board’s own unit and its placement, whatever copy names it', () => {
    // The same unit, who it is, named with a claimed Range 9.
    const claimed = {
      ...archer,
      unitType: {
        ...archer.unitType,
        stats: { ...archer.unitType.stats, range: 9 },
      },
    };

    // The board's unit, Range 2, where it stands.
    expect(findUnitWithPlacementOnBoard(state, claimed)).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: archer,
    });
  });

  it('gives the second of two engaged units the facing opposite the first', () => {
    // White's unit at E-5 faces north; Black's, engaged with it, faces south.
    const primary = createTestUnit('white');
    const secondary = createTestUnit('black');
    const engaged = replaceBoard(
      createEmptyGameState('standard'),
      createBoardWithEngagedUnits(primary, secondary, 'E-5', 'north'),
    );

    // Each is the board's own unit, the second facing opposite the first.
    expect(findUnitWithPlacementOnBoard(engaged, primary)).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: primary,
    });
    expect(findUnitWithPlacementOnBoard(engaged, secondary)).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'south' },
      unit: secondary,
    });
  });

  it('answers nothing for a unit waiting in reserve', () => {
    // A unit not yet deployed is not on the board.
    const reserve = createTestUnit('black');
    const waiting = withReservedUnits(createEmptyGameState('standard'), [
      reserve,
    ]);

    expect(findUnitWithPlacementOnBoard(waiting, reserve)).toBeUndefined();
  });
});
