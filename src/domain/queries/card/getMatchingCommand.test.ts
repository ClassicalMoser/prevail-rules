import { createTestCommand } from '@testing';

import { getMatchingCommand } from './getMatchingCommand';

/**
 * The remaining command an issued order spends. The search is
 * findMatchingCommand's; this only insists there is a match, as a checked
 * order has.
 */
describe('getMatchingCommand function', () => {
  it('gives the list member matching an equal copy', () => {
    // The player has one command left; the order names an equal copy.
    const member = createTestCommand();
    const copy = createTestCommand();

    // The member itself comes back, so it can be removed from the list.
    expect(getMatchingCommand([member], copy)).toBe(member);
  });

  it('throws when nothing matches, which validation rules out first', () => {
    // The player's one command orders two units; the order names one.
    const member = createTestCommand({ number: 2 });
    const other = createTestCommand({ number: 1 });

    // A checked order always matches a remaining command, so this is a fault.
    expect(() => getMatchingCommand([member], other)).toThrow(
      new Error('No remaining command matches the one issued'),
    );
  });
});
