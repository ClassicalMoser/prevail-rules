import { isSameUnitSupportKind } from './isSameUnitSupportKind';

/**
 * After a rally, cards naming the same thing stack into one stack of places;
 * cards naming different things stay separate (§10.4.3). The number of places
 * each holds does not matter to the stacking.
 *
 * Each kind check is followed by a comparison of the field only that kind
 * carries (the trait, the unit type), so a support of another kind fails the
 * second comparison too. No well-formed support can separate the two checks,
 * which is why no case below tries.
 */
describe('isSameUnitSupportKind function', () => {
  const unitTypeId = '6bb57a16-946b-4c79-b551-eb0480041c3f';

  it('stacks two generic supports whatever number of places each holds', () => {
    // Generic ×1 and generic ×2 name the same thing: any unit (§10.4.3).
    expect(
      isSameUnitSupportKind(
        { count: 1, supportType: 'generic' },
        { count: 2, supportType: 'generic' },
      ),
    ).toBe(true);
  });

  it('keeps generic support apart from trait support', () => {
    // A generic stack and a formation stack are two stacks, not one.
    expect(
      isSameUnitSupportKind(
        { count: 1, supportType: 'generic' },
        { count: 2, supportType: 'trait', trait: 'formation' },
      ),
    ).toBe(false);
  });

  it('stacks trait supports only for the same trait', () => {
    // Two formation cards stack …
    expect(
      isSameUnitSupportKind(
        { count: 2, supportType: 'trait', trait: 'formation' },
        { count: 4, supportType: 'trait', trait: 'formation' },
      ),
    ).toBe(true);
    // … and a phalanx card stays a stack of its own.
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
        { count: 1, supportType: 'unitType', unitTypeId },
        { count: 1, supportType: 'generic' },
      ),
    ).toBe(false);
  });

  it('stacks unit-type supports only for the same unit type', () => {
    // Two cards naming one unit type stack …
    expect(
      isSameUnitSupportKind(
        { count: 1, supportType: 'unitType', unitTypeId },
        { count: 3, supportType: 'unitType', unitTypeId },
      ),
    ).toBe(true);
    // … and a card naming another type does not.
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

  it('throws on a support of a kind the rules do not name', () => {
    // Only generic, trait and unit-type support exist; the type forbids any
    // other, so the spec forces one through to reach the fault.
    const unknown = { count: 1, supportType: 'tribal' } as never;

    expect(() =>
      isSameUnitSupportKind(unknown, { count: 1, supportType: 'generic' }),
    ).toThrow('Unknown unit support type: tribal');
  });
});
