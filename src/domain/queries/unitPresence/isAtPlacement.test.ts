import type { Coordinate } from '@ruleValues';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { isAtPlacement } from './isAtPlacement';

/**
 * Whether a unit stands where a caller says: its side's unit on that space,
 * facing that way, and the very unit named. A retreat is worked out from where
 * the unit stands, so `getLegalRetreats` asks this first.
 */
describe('isAtPlacement function', () => {
  it('throws, naming the coordinate, when the placement is not on the board', () => {
    const unit = createTestUnit('black');
    const invalidCoordinate = 'Z-99' as Coordinate;
    const unitWithPlacement = placed(unit, invalidCoordinate, 'north');

    // A placement names where the unit is said to stand, so a space that does
    // not exist is a fault in the placement, not a unit that is elsewhere.
    expect(() =>
      isAtPlacement(createEmptyStandardBoard(), unitWithPlacement),
    ).toThrow('Coordinate Z-99 does not exist on standard board.');
  });

  it('accepts a unit standing on the named space, facing the named way', () => {
    // Black's unit at E-5 facing north; the caller names a separately built
    // copy, as an event does, so it is matched by who it is.
    const onBoard = createTestUnit('black', { instanceNumber: 1 });
    const named = createTestUnit('black', { instanceNumber: 1 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);

    expect(isAtPlacement(board, placed(named, 'E-5', 'north'))).toStrictEqual({
      result: true,
    });
  });

  it('refuses when no unit of that side stands on the space', () => {
    // E-5 is empty on one board and holds a white unit on the other.
    const unit = createTestUnit('black');
    const withEnemy = createBoardWithUnits([
      placed(createTestUnit('white'), 'E-5', 'north'),
    ]);

    // Either way, black has no unit there.
    const refusal = {
      errorReason: 'No friendly unit at coordinate',
      result: false,
    };

    // The empty space.
    expect(
      isAtPlacement(createEmptyStandardBoard(), placed(unit, 'E-5', 'north')),
    ).toStrictEqual(refusal);

    // The space with only an enemy in it.
    expect(
      isAtPlacement(withEnemy, placed(unit, 'E-5', 'north')),
    ).toStrictEqual(refusal);
  });

  it('refuses when the unit faces another way than named', () => {
    // The unit faces north; the caller says south.
    const unit = createTestUnit('black');
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    // Facing is half of where a unit stands (§2.3).
    expect(isAtPlacement(board, placed(unit, 'E-5', 'south'))).toStrictEqual({
      errorReason: 'Declared facing does not match facing of unit present',
      result: false,
    });
  });

  it('refuses when another unit of that side stands there', () => {
    // Black's first unit of the type is at E-5; the caller names its second.
    const onBoard = createTestUnit('black', { instanceNumber: 1 });
    const named = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);

    expect(isAtPlacement(board, placed(named, 'E-5', 'north'))).toStrictEqual({
      errorReason: 'Unit is not at the placement',
      result: false,
    });
  });

  it('accepts either unit of an engaged space at the facing it holds there', () => {
    // Black stands at E-5 facing north-east; White walked into it and faces
    // south-west, the two facing one another.
    const black = createTestUnit('black');
    const white = createTestUnit('white');
    const board = createBoardWithEngagedUnits(black, white, 'E-5', 'northEast');

    const blackAsHeld = placed(black, 'E-5', 'northEast');
    const whiteAsHeld = placed(white, 'E-5', 'southWest');

    // Each, named facing the way it holds the space, is where it is said to be.
    expect(isAtPlacement(board, blackAsHeld).result).toBe(true);
    expect(isAtPlacement(board, whiteAsHeld).result).toBe(true);
  });

  it('refuses the secondary of an engaged space named at the primary’s facing', () => {
    // White stands at E-5 facing north; Black walked into it and faces south.
    const white = createTestUnit('white');
    const black = createTestUnit('black');
    const board = createBoardWithEngagedUnits(white, black, 'E-5', 'north');

    // Naming Black facing north is the wrong way round.
    expect(isAtPlacement(board, placed(black, 'E-5', 'north'))).toStrictEqual({
      errorReason: 'Declared facing does not match facing of unit present',
      result: false,
    });
  });
});
