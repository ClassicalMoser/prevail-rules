import { createTestUnit } from '@testing';

import { setWithoutUnit } from './setWithoutUnit';

/**
 * A set less one unit, matched by who it is rather than by the object the
 * set holds.
 */
describe('setWithoutUnit function', () => {
  it('leaves out the unit a separate copy names, and keeps the rest', () => {
    // Black's first unit and a white one.
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    // The black unit as an event names it.
    const copy = createTestUnit('black', { instanceNumber: 1 });

    expect(setWithoutUnit(new Set([unit, other]), copy)).toStrictEqual(
      new Set([other]),
    );
  });

  it('leaves the set as it was when the unit is not in it', () => {
    // Only Black's unit is held; White's is asked to leave.
    const unit = createTestUnit('black');

    expect(
      setWithoutUnit(new Set([unit]), createTestUnit('white')),
    ).toStrictEqual(new Set([unit]));
  });
});
