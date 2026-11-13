import { haveSameMembers } from './haveSameMembers';

/**
 * A list of traits or stats on a card is a set of facts, not a sequence, so
 * two lists match when they hold the same members as many times each.
 */
describe('haveSameMembers function', () => {
  it('ignores the order the members were written in', () => {
    // Attack and Speed are the same two stats in either order.
    expect(haveSameMembers(['attack', 'speed'], ['speed', 'attack'])).toBe(
      true,
    );
  });

  it('counts a repeated member once for each copy', () => {
    // Attack listed three times is not Attack listed once.
    expect(haveSameMembers(['attack', 'attack', 'attack'], ['attack'])).toBe(
      false,
    );

    // Two members each, but the second list's second is Speed, not Attack.
    expect(haveSameMembers(['attack', 'attack'], ['attack', 'speed'])).toBe(
      false,
    );
  });

  it('holds for two empty lists', () => {
    // A card naming no stats matches another naming none.
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
