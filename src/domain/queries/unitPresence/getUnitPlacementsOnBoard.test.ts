import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';

import { getUnitIdentityKey } from '../unit/unitEquivalence/getUnitIdentityKey';
import { getUnitPlacementsOnBoard } from './getUnitPlacementsOnBoard';

/**
 * Where every unit on a board stands, read once per board and looked up by
 * the unit's identity.
 */
describe('getUnitPlacementsOnBoard function', () => {
  it('places a lone unit where it stands, facing as it was placed', () => {
    // One black unit at E-5 facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    expect(
      getUnitPlacementsOnBoard(board).get(getUnitIdentityKey(unit)),
    ).toStrictEqual({ coordinate: 'E-5', facing: 'north' });
  });

  it('places two engaged units in one space, looking at each other', () => {
    // The primary is stored facing north; the secondary faces it, south.
    const primary = createTestUnit('white', { attack: 3 });
    const secondary = createTestUnit('black', { attack: 3 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );
    const placements = getUnitPlacementsOnBoard(board);

    expect(placements.get(getUnitIdentityKey(primary))).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
    expect(placements.get(getUnitIdentityKey(secondary))).toStrictEqual({
      coordinate: 'E-5',
      facing: 'south',
    });
  });

  it('reads a board once: asking again gives the same reading', () => {
    // A board is never written in place, so its first reading stands.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    expect(getUnitPlacementsOnBoard(board)).toBe(
      getUnitPlacementsOnBoard(board),
    );
  });

  it('reads a new board afresh, so a unit that has moved is found where it now stands', () => {
    // The same unit on two boards, as before and after a move.
    const unit = createTestUnit('black', { attack: 3 });
    const before = createBoardWithUnits([placed(unit, 'E-5', 'north')]);
    const after = createBoardWithUnits([placed(unit, 'D-5', 'north')]);
    const key = getUnitIdentityKey(unit);

    expect(getUnitPlacementsOnBoard(before).get(key)?.coordinate).toBe('E-5');
    expect(getUnitPlacementsOnBoard(after).get(key)?.coordinate).toBe('D-5');
  });
});
