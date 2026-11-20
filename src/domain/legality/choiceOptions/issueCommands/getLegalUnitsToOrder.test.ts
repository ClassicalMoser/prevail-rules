import type { Coordinate } from '@entities';
import {
  createBoardWithFacingRow,
  createTestCommand,
  replaceBoard,
} from '@testing';

import { getLegalUnitsToOrder } from './getLegalUnitsToOrder';

import { createEmptyGameState } from '@factories';

/**
 * A units order takes up to its printed number of eligible units, and none
 * declines it (§4.3.2). The number is a ceiling, not a quota, and a unit is
 * chosen once. The units are offered one at a time.
 *
 * Black has three units, on E-1 to E-3, and an order for up to two of them
 * with no range limit.
 */
describe('getLegalUnitsToOrder function', () => {
  const upToTwo = createTestCommand({
    number: 2,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'units',
  });
  const coordinates: Coordinate[] = ['E-1', 'E-2', 'E-3'];
  const { board, unitAt } = createBoardWithFacingRow({ coordinates });
  const state = replaceBoard(createEmptyGameState('standard'), board);
  const [first, second, third] = coordinates.map(
    (coordinate) => unitAt(coordinate).unit,
  );
  if (first === undefined || second === undefined || third === undefined) {
    throw new Error('Expected three units');
  }

  it('offers every eligible unit first, and lets the player decline before choosing any', () => {
    // Nothing chosen yet.
    const choice = getLegalUnitsToOrder(upToTwo, 'black', state, []);

    // Every eligible unit is open, and stopping now orders nobody, which
    // declines the order (§4.3.2).
    expect(choice).toStrictEqual({
      mayStop: true,
      next: [first, second, third],
    });
  });

  it('offers the rest once a unit is chosen, and lets the player stop at one', () => {
    // One unit is under the number, and is enough to give the order.
    const choice = getLegalUnitsToOrder(upToTwo, 'black', state, [second]);

    expect(choice).toStrictEqual({ mayStop: true, next: [first, third] });
  });

  it('offers nobody more once the number is reached', () => {
    const choice = getLegalUnitsToOrder(upToTwo, 'black', state, [
      third,
      first,
    ]);

    expect(choice).toStrictEqual({ mayStop: true, next: [] });
  });
});
