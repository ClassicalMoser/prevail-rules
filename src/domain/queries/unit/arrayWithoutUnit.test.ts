import { createTestUnit } from '@testing';

import { arrayWithoutUnit } from './arrayWithoutUnit';

/**
 * A list less one unit, matched by who it is: a unit leaves the units still
 * to act once it has moved or shot, and the reserve once it deploys.
 */
describe('arrayWithoutUnit function', () => {
  it('leaves out the unit a separate copy names, and keeps the rest', () => {
    // Black's first unit and a white one still to act.
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    // The black unit as an event names it.
    const copy = createTestUnit('black', { instanceNumber: 1 });

    expect(arrayWithoutUnit([unit, other], copy)).toStrictEqual([other]);
  });

  it('leaves the list as it was when the unit is not in it', () => {
    // Only Black's unit is listed; White's is asked to leave.
    const unit = createTestUnit('black');

    expect(arrayWithoutUnit([unit], createTestUnit('white'))).toStrictEqual([
      unit,
    ]);
  });
});
