import { getTurnedState } from './getTurnedState';

/**
 * A turn in place keeps the space, changes the facing, spends a point, and
 * joins the path (§5.2.1).
 */
describe('getTurnedState function', () => {
  it('a right turn faces 45° clockwise, spends a point, and is recorded', () => {
    // A unit that has stepped once from E-5 to D-5, facing north.
    const turned = getTurnedState(
      {
        cameFrom: 'E-5',
        coordinate: 'D-5',
        facing: 'north',
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
      path: ['step', 'turnRight'],
      remainingFlexibility: 1,
      remainingSpeed: 1,
    });
  });
});
