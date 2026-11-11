import type { Coordinate } from '@entities';
import { createBoardWithFacingRow, createTestCommand } from '@testing';
import { updateBoardState } from '@transforms';

import { getLegalUnitsToOrder } from './getLegalUnitsToOrder';

import { createEmptyGameState } from '@factories';

/**
 * A units order takes between one and its printed number of eligible units
 * (§4.3.2). The number is a ceiling, not a quota, and a unit is chosen once.
 * The units are offered one at a time.
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
  const state = updateBoardState(createEmptyGameState('standard'), board);
  const [first, second, third] = coordinates.map(
    (coordinate) => unitAt(coordinate).unit,
  );
  if (first === undefined || second === undefined || third === undefined) {
    throw new Error('Expected three units');
  }

  it('offers every eligible unit first, and does not let the order go to nobody', () => {
    const choice = getLegalUnitsToOrder(upToTwo, 'black', state, []);

    expect(choice).toStrictEqual({
      mayStop: false,
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
