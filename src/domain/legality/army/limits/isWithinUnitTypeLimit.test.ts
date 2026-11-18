import { isWithinUnitTypeLimit } from './isWithinUnitTypeLimit';

/** A unit type's own limit caps the copies one list may field (§3.1.4). */
describe('isWithinUnitTypeLimit function', () => {
  it('allows as many copies as the limit', () => {
    expect(isWithinUnitTypeLimit(4, 4)).toBe(true);
  });

  it('refuses one copy more', () => {
    expect(isWithinUnitTypeLimit(5, 4)).toBe(false);
  });
});
