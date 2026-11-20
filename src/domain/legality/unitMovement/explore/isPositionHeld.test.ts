import type { MoveState } from './moveState';
import { isPositionHeld } from './isPositionHeld';

/**
 * A move may not come back to a position it held: the same space, facing
 * the same way (§5.2.4). A position is the two together.
 */
describe('isPositionHeld function', () => {
  // A unit that started on E-5 facing north, stepped to D-5, and turned to
  // face north-east there.
  const state: MoveState = {
    cameFrom: 'E-5',
    coordinate: 'D-5',
    facing: 'northEast',
    heldPositions: [
      { coordinate: 'E-5', facing: 'north' },
      { coordinate: 'D-5', facing: 'north' },
      { coordinate: 'D-5', facing: 'northEast' },
    ],
    path: ['step', 'turnRight'],
    remainingFlexibility: 1,
    remainingSpeed: 1,
  };

  it('finds a position the move held earlier', () => {
    // Where it started, and where it faced before turning on D-5.
    expect(isPositionHeld(state, 'E-5', 'north')).toBe(true);
    expect(isPositionHeld(state, 'D-5', 'north')).toBe(true);
  });

  it('does not count a held space faced another way', () => {
    // E-5 was held facing north, not north-east.
    expect(isPositionHeld(state, 'E-5', 'northEast')).toBe(false);
  });

  it('does not count a new space faced a held way', () => {
    // C-5 facing north is a new position, though the move faced north before.
    expect(isPositionHeld(state, 'C-5', 'north')).toBe(false);
  });
});
