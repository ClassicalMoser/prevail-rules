import { createEmptyStandardBoard } from '@factories';
import { createUnitWithPlacement } from '@testing';
import { addUnitToBoard } from '@transforms';

import { getEngagementEndFacing } from './getEngagementEndFacing';

/**
 * A front approach squares up head-on, spending the point when the step
 * arrived oblique (§6.2.3); flank and rear approaches fight as they arrived.
 */
describe('getEngagementEndFacing function', () => {
  // A south-facing defender: its front spaces are the E row below it.
  const defender = createUnitWithPlacement({
    coordinate: 'D-5',
    facing: 'south',
    playerSide: 'white',
  });
  const board = addUnitToBoard(createEmptyStandardBoard(), defender);

  it('a corner front approach squares to head-on and spends the point', () => {
    // Stepping in from E-4, the defender's off-centre front space, arrives
    // facing northEast; the engagement ends facing north, squared.
    const end = getEngagementEndFacing(board, 'D-5', 'E-4', 'northEast');

    expect(end).toStrictEqual({ facing: 'north', flexibilitySpent: 1 });
  });

  it('a head-on approach is already square and spends nothing', () => {
    const end = getEngagementEndFacing(board, 'D-5', 'E-5', 'north');

    expect(end).toStrictEqual({ facing: 'north', flexibilitySpent: 0 });
  });

  it('a flank approach keeps the facing it arrived on', () => {
    // D-4 is at the south-facing defender's shoulder: a flank approach.
    // The defender is the one dragged around, not the attacker (§6.3.4).
    const end = getEngagementEndFacing(board, 'D-5', 'D-4', 'east');

    expect(end).toStrictEqual({ facing: 'east', flexibilitySpent: 0 });
  });

  it('open ground is no one to square up against', () => {
    const end = getEngagementEndFacing(board, 'C-5', 'C-4', 'east');

    expect(end).toBeUndefined();
  });
});
