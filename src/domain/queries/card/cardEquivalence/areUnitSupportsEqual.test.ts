import { areUnitSupportsEqual } from './areUnitSupportsEqual';

describe('areUnitSupportsEqual function', () => {
  it('holds for the same kind of support for the same number of units', () => {
    expect(
      areUnitSupportsEqual(
        { count: 2, supportType: 'generic' },
        { count: 2, supportType: 'generic' },
      ),
    ).toBe(true);
  });

  it('fails when the number of units differs', () => {
    expect(
      areUnitSupportsEqual(
        { count: 1, supportType: 'generic' },
        { count: 2, supportType: 'generic' },
      ),
    ).toBe(false);
  });

  it('fails when one names a unit type and the other is generic', () => {
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
