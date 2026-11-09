import { createEmptyStandardBoard } from '@factories';
import { createUnitWithPlacement } from '@testing';
import { addUnitToBoard } from '@transforms';

import { getEngagementEndFacing } from './getEngagementEndFacing';

/**
 * A front approach squares up head-on, with one recorded turn when the step
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

  it('a corner front approach squares to head-on with one turn, for a point', () => {
    // Stepping in from E-4, the defender's off-centre front space, arrives
    // facing northEast; a turn to its left squares it to north.
    const end = getEngagementEndFacing(board, 'D-5', 'E-4', 'northEast');

    expect(end).toStrictEqual({ facing: 'north', squaringTurn: 'turnLeft' });
  });

  it('a head-on approach is already square and needs no turn', () => {
    const end = getEngagementEndFacing(board, 'D-5', 'E-5', 'north');

    expect(end).toStrictEqual({ facing: 'north', squaringTurn: null });
  });

  it('a flank approach keeps the facing it arrived on', () => {
    // D-4 is at the south-facing defender's shoulder: a flank approach.
    // The defender is the one dragged around, not the attacker (§6.3.4).
    const end = getEngagementEndFacing(board, 'D-5', 'D-4', 'east');

    expect(end).toStrictEqual({ facing: 'east', squaringTurn: null });
  });

  it('open ground is no one to square up against', () => {
    const end = getEngagementEndFacing(board, 'C-5', 'C-4', 'east');

    expect(end).toBeUndefined();
  });
});
