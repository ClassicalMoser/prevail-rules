import { areUnitSupportsEqual } from './areUnitSupportsEqual';

/**
 * Two cards grant the same unit support when they hold the same number of
 * places for the same kind of unit (§10.4.2).
 */
describe('areUnitSupportsEqual function', () => {
  it('holds for the same kind of support for the same number of units', () => {
    // Generic ×2 on both.
    expect(
      areUnitSupportsEqual(
        { count: 2, supportType: 'generic' },
        { count: 2, supportType: 'generic' },
      ),
    ).toBe(true);
  });

  it('fails when the number of units differs', () => {
    // Generic ×1 holds one place fewer than generic ×2.
    expect(
      areUnitSupportsEqual(
        { count: 1, supportType: 'generic' },
        { count: 2, supportType: 'generic' },
      ),
    ).toBe(false);
  });

  it('fails when one names a unit type and the other is generic', () => {
    // The same single place, but for different kinds of unit.
    expect(
      areUnitSupportsEqual(
        {
          count: 1,
          supportType: 'unitType',
          unitTypeId: '6bb57a16-946b-4c79-b551-eb0480041c3f',
        },
        { count: 1, supportType: 'generic' },
      ),
    ).toBe(false);
  });
});
