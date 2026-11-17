import { isSameUnitSupportKind } from './isSameUnitSupportKind';

describe('isSameUnitSupportKind function', () => {
  it('stacks two generic supports whatever number of places each holds', () => {
    // Generic ×1 and generic ×2 name the same thing: any unit (§10.4.3).
    expect(
      isSameUnitSupportKind(
        { count: 1, supportType: 'generic' },
        { count: 2, supportType: 'generic' },
      ),
    ).toBe(true);
  });

  it('stacks trait supports only for the same trait', () => {
    // Two formation cards stack; a phalanx card stays a stack of its own.
    expect(
      isSameUnitSupportKind(
        { count: 2, supportType: 'trait', trait: 'formation' },
        { count: 4, supportType: 'trait', trait: 'formation' },
      ),
    ).toBe(true);
    expect(
      isSameUnitSupportKind(
        { count: 2, supportType: 'trait', trait: 'formation' },
        { count: 2, supportType: 'trait', trait: 'phalanx' },
      ),
    ).toBe(false);
  });

  it('keeps unit-type support apart from generic support', () => {
    // Naming a unit type is a different stack from naming any unit.
    expect(
      isSameUnitSupportKind(
        {
          count: 1,
          supportType: 'unitType',
          unitTypeId: '6bb57a16-946b-4c79-b551-eb0480041c3f',
        },
        { count: 1, supportType: 'generic' },
      ),
    ).toBe(false);
  });

  it('stacks unit-type supports only for the same unit type', () => {
    // Two cards naming one unit type stack; another type does not.
    const unitTypeId = '6bb57a16-946b-4c79-b551-eb0480041c3f';
    expect(
      isSameUnitSupportKind(
        { count: 1, supportType: 'unitType', unitTypeId },
        { count: 3, supportType: 'unitType', unitTypeId },
      ),
    ).toBe(true);
    expect(
      isSameUnitSupportKind(
        { count: 1, supportType: 'unitType', unitTypeId },
        {
          count: 1,
          supportType: 'unitType',
          unitTypeId: '7cc68b27-a57c-4d8a-a662-fc1591152d40',
        },
      ),
    ).toBe(false);
  });
});
