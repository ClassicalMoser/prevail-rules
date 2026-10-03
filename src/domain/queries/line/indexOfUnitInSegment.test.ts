import { createUnitWithPlacement } from '@testing';

import { indexOfUnitInSegment } from './indexOfUnitInSegment';

/**
 * A segment holds one unit per space. The index is the place of that
 * coordinate in the ordered segment.
 */
describe(indexOfUnitInSegment, () => {
  it('a lone unit is at index 0', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const segment = [unit];

    expect(indexOfUnitInSegment(segment, unit)).toBe(0);
  });

  it('a unit with neighbors on both sides is in the middle', () => {
    const left = createUnitWithPlacement({
      coordinate: 'E-4',
      unitOptions: { instanceNumber: 1 },
    });
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      unitOptions: { instanceNumber: 2 },
    });
    const right = createUnitWithPlacement({
      coordinate: 'E-6',
      unitOptions: { instanceNumber: 3 },
    });
    const segment = [left, unit, right];

    expect(indexOfUnitInSegment(segment, unit)).toBe(1);
  });

  it('throws when the unit coordinate is not in the segment', () => {
    const inSegment = createUnitWithPlacement({ coordinate: 'E-5' });
    const elsewhere = createUnitWithPlacement({ coordinate: 'A-1' });

    expect(() => indexOfUnitInSegment([inSegment], elsewhere)).toThrow(
      'Unit is not in the segment',
    );
  });
});
