import { createGameState } from '@testing';

import { getEngagementEndFacing } from './getEngagementEndFacing';

/**
 * A front approach squares up head-on, with one recorded turn when the step
 * arrived oblique (§6.2.3); flank and rear approaches fight as they arrived.
 */
describe('getEngagementEndFacing function', () => {
  // A south-facing defender: its front spaces are the E row below it.
  const board = createGameState([['D-5', 'white', 'south']]).boardState;

  it('a corner front approach squares to head-on with one turn, for a point', () => {
    // Stepping in from E-4, the defender's off-centre front space, arrives
    // facing northEast; a turn to its left squares it to north.
    const end = getEngagementEndFacing(board, 'D-5', 'E-4');

    expect(end).toStrictEqual({ facing: 'north', squaringTurn: 'turnLeft' });
  });

  it('the other corner front approach squares with a turn the other way', () => {
    // From E-6 the step arrives facing northWest; a turn to its right
    // squares it to north. Which way the turn goes is the path's to record.
    const end = getEngagementEndFacing(board, 'D-5', 'E-6');

    expect(end).toStrictEqual({ facing: 'north', squaringTurn: 'turnRight' });
  });

  it('a head-on approach is already square and needs no turn', () => {
    const end = getEngagementEndFacing(board, 'D-5', 'E-5');

    expect(end).toStrictEqual({ facing: 'north', squaringTurn: null });
  });

  it('a flank approach keeps the facing it arrived on', () => {
    // D-4 is at the south-facing defender's shoulder: a flank approach.
    // The defender is the one dragged around, not the attacker (§6.3.4).
    const end = getEngagementEndFacing(board, 'D-5', 'D-4');

    expect(end).toStrictEqual({ facing: 'east', squaringTurn: null });
  });

  it('open ground is no one to square up against', () => {
    const end = getEngagementEndFacing(board, 'C-5', 'C-4');

    expect(end).toBeUndefined();
  });

  it('a space that is not a neighbour was not joined to the defender by a step', () => {
    // G-5 is three rows below the defender: no single step leaves it for D-5.
    const end = getEngagementEndFacing(board, 'D-5', 'G-5');

    expect(end).toBeUndefined();
  });
});
