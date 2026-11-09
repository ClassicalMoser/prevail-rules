import { createTestUnit, placed } from '@testing';

import { isSameUnitWithPlacement } from './isSameUnitWithPlacement';

/**
 * The same unit, on the same space, facing the same way — all three, or no
 * match.
 */
describe('isSameUnitWithPlacement function', () => {
  // Two separately built copies of one black unit: matched by value, as a
  // validator matches a choice against freshly built legal options.
  const unit = createTestUnit('black');
  const sameUnit = createTestUnit('black');
  // A second instance of the same type is a different unit.
  const otherUnit = createTestUnit('black', { instanceNumber: 2 });

  it('the same unit placed the same way matches', () => {
    const { result } = isSameUnitWithPlacement(
      placed(unit, 'E-5', 'north'),
      placed(sameUnit, 'E-5', 'north'),
    );

    expect(result).toBe(true);
  });

  it('the same unit facing another way does not match', () => {
    expect(
      isSameUnitWithPlacement(
        placed(unit, 'E-5', 'north'),
        placed(sameUnit, 'E-5', 'south'),
      ),
    ).toStrictEqual({
      errorReason: 'The same unit, placed differently',
      result: false,
    });
  });

  it('another unit on the same placement does not match', () => {
    const { result } = isSameUnitWithPlacement(
      placed(unit, 'E-5', 'north'),
      placed(otherUnit, 'E-5', 'north'),
    );

    expect(result).toBe(false);
  });
});
