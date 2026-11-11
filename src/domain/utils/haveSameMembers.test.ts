import { haveSameMembers } from './haveSameMembers';

describe('haveSameMembers function', () => {
  it('ignores the order the members were written in', () => {
    expect(haveSameMembers(['attack', 'speed'], ['speed', 'attack'])).toBe(
      true,
    );
  });

  it('counts a repeated member once for each copy', () => {
    // Attack listed three times is not Attack listed once.
    expect(haveSameMembers(['attack', 'attack', 'attack'], ['attack'])).toBe(
      false,
    );
    expect(haveSameMembers(['attack', 'attack'], ['attack', 'speed'])).toBe(
      false,
    );
  });

  it('holds for two empty lists', () => {
    expect(haveSameMembers([], [])).toBe(true);
  });

  it('compares other values only by the rule it is given', () => {
    // Two modifiers with equal contents are separate objects, so they are
    // the same member only by a rule that reads their contents.
    const left = [{ type: 'attack', value: 1 }];
    const right = [{ type: 'attack', value: 1 }];

    expect(
      haveSameMembers(
        left,
        right,
        (a, b) => a.type === b.type && a.value === b.value,
      ),
    ).toBe(true);
  });
});
