import type { Coordinate } from '@ruleValues';
import {
  createBoardWithFacingRow,
  createGameStateWithBoard,
  createTestCommand,
} from '@testing';

import {
  getLegalUnitsToOrder,
  getUnitsOrderRefusalReason,
} from './getLegalUnitsToOrder';

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
  const state = createGameStateWithBoard(board);
  const first = unitAt('E-1').unit;
  const second = unitAt('E-2').unit;
  const third = unitAt('E-3').unit;

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

/**
 * When a submitted units order names a unit that was not offered, the
 * refusal says which rule it breaks (§4.3.2–4.3.4): a unit named twice, more
 * units than the printed number, or a unit the order may not name at all.
 */
describe('getUnitsOrderRefusalReason function', () => {
  const upToTwo = createTestCommand({
    number: 2,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'units',
  });
  // Black's three units, on E-1 to E-3.
  const { unitAt } = createBoardWithFacingRow({
    coordinates: ['E-1', 'E-2', 'E-3'],
  });
  const first = unitAt('E-1').unit;
  const second = unitAt('E-2').unit;
  const third = unitAt('E-3').unit;

  it('refuses a unit named twice', () => {
    // E-1, then E-1 again: two names, the number of the order.
    expect(getUnitsOrderRefusalReason(upToTwo, [first, first], 1)).toBe(
      'Duplicate units in issue command selection',
    );
  });

  it('refuses a repeat as a repeat, even past the number', () => {
    // E-1, E-2, then E-1 again: the repeat is asked first (§4.3.6).
    expect(getUnitsOrderRefusalReason(upToTwo, [first, second, first], 2)).toBe(
      'Duplicate units in issue command selection',
    );
  });

  it('refuses a unit past the printed number', () => {
    // Three different units under an order for two (§4.3.2).
    expect(getUnitsOrderRefusalReason(upToTwo, [first, second, third], 2)).toBe(
      'Expected at most 2 units, got 3',
    );
  });

  it('refuses any other unit as not one the order may name', () => {
    // The first unit named was refused. Under the number and not a repeat,
    // the reason left is the unit itself: the restrictions leave it out, or
    // it is ordered or engaged already (§4.3.4).
    expect(getUnitsOrderRefusalReason(upToTwo, [first], 0)).toBe(
      'Unit is not eligible for this command under its restrictions',
    );
  });

  it('throws when asked about a position with no unit', () => {
    // One unit submitted; there is nothing at the second position to refuse.
    expect(() => getUnitsOrderRefusalReason(upToTwo, [first], 1)).toThrow(
      'No unit at position 1',
    );
  });
});
