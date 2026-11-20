import { getTurnedState } from './getTurnedState';

/**
 * A turn in place keeps the space, changes the facing, spends a point, joins
 * the path (§5.2.1), and adds its new position to those held (§5.2.4).
 */
describe('getTurnedState function', () => {
  it('a right turn faces 45° clockwise, spends a point, and is recorded', () => {
    // A unit that has stepped once from E-5 to D-5, facing north.
    const turned = getTurnedState(
      {
        cameFrom: 'E-5',
        coordinate: 'D-5',
        facing: 'north',
        // Where it started, then the space it stepped into.
        heldPositions: [
          { coordinate: 'E-5', facing: 'north' },
          { coordinate: 'D-5', facing: 'north' },
        ],
        path: ['step'],
        remainingFlexibility: 2,
        remainingSpeed: 1,
      },
      'turnRight',
    );

    expect(turned).toStrictEqual({
      cameFrom: 'E-5',
      coordinate: 'D-5',
      facing: 'northEast',
      // The turn adds D-5 facing north-east to the positions held.
      heldPositions: [
        { coordinate: 'E-5', facing: 'north' },
        { coordinate: 'D-5', facing: 'north' },
        { coordinate: 'D-5', facing: 'northEast' },
      ],
      path: ['step', 'turnRight'],
      remainingFlexibility: 1,
      remainingSpeed: 1,
    });
  });
});
