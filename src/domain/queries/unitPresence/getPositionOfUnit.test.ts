import {
  createBoardWithUnits,
  createGameStateWithBoard,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { getPositionOfUnit } from './getPositionOfUnit';

/**
 * A caller that names a unit to act on it needs it on the board. Where it
 * stands is `findPositionOfUnit`'s to work out; this only insists it is there.
 */
describe('getPositionOfUnit function', () => {
  it('gives the space a unit stands on and the way it faces', () => {
    // A black unit at E-5 facing south-east.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'southEast')]);

    // Both halves of where it stands.
    expect(
      getPositionOfUnit(createGameStateWithBoard(board), unit),
    ).toStrictEqual({ coordinate: 'E-5', facing: 'southEast' });
  });

  it('throws when the unit is not on the board', () => {
    // An empty board: the named unit has routed, or was never placed.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createEmptyStandardBoard();

    // A unit named to act must be there, so its absence is a fault.
    expect(() =>
      getPositionOfUnit(createGameStateWithBoard(board), unit),
    ).toThrow(new Error('Unit not found on board'));
  });
});
