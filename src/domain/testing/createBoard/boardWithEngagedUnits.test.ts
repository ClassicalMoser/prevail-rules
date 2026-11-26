import { createTestUnit } from '@testing/unitHelpers';

import { createBoardWithEngagedUnits } from './boardWithEngagedUnits';

/** Two enemy units sharing one space, squared up, as a move into an enemy leaves them (§6.1.1). */
describe('createBoardWithEngagedUnits function', () => {
  it('locks the two units in E-5, the primary facing north and the secondary south', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');

    const board = createBoardWithEngagedUnits(primary, secondary);

    expect(board.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: primary,
      secondaryUnit: secondary,
    });
  });

  it('engages them on the space and facing a spec names', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');

    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'D-4',
      'east',
    );

    expect(board.board['D-4']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'east',
      primaryUnit: primary,
      secondaryUnit: secondary,
    });
  });
});
