import { createTestCommand } from '@testing';

import { findMatchingCommand } from './findMatchingCommand';

/**
 * FindMatchingCommand: the list member that matches type, size, number, restrictions, and modifiers.
 */
describe('findMatchingCommand function', () => {
  it('the same object matches itself', () => {
    const member = createTestCommand();
    const list = [member];
    expect(findMatchingCommand(list, member)).toBe(member);
  });

  it('an exact copy matches the list member', () => {
    const member = createTestCommand();
    const list = [member];
    const copy = createTestCommand();
    expect(findMatchingCommand(list, copy)).toBe(member);
  });

  it('a reordered copy still matches the list member', () => {
    const member = createTestCommand({
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword', 'skirmish'],
        unitRestrictions: ['restriction-id-1', 'restriction-id-2'],
      },
    });
    const alternateCopy = createTestCommand({
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['skirmish', 'sword'],
        unitRestrictions: ['restriction-id-2', 'restriction-id-1'],
      },
    });

    // The result is the list member, not the copy.
    expect(findMatchingCommand([member], alternateCopy)).toBe(member);
  });

  it('a different type is not a match', () => {
    const member = createTestCommand();

    const searchCommand = createTestCommand({
      type: 'rangedAttack',
    });

    expect(findMatchingCommand([member], searchCommand)).toBeUndefined();
  });

  it('a different size is not a match', () => {
    const member = createTestCommand();

    const searchCommand = createTestCommand({
      size: 'lines',
    });

    expect(findMatchingCommand([member], searchCommand)).toBeUndefined();
  });

  it('a different number is not a match', () => {
    const member = createTestCommand();

    const searchCommand = createTestCommand({
      number: 2,
    });

    expect(findMatchingCommand([member], searchCommand)).toBeUndefined();
  });

  it('a different restriction is not a match', () => {
    const member = createTestCommand({
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    });

    const searchCommand = createTestCommand({
      restrictions: {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    });

    expect(findMatchingCommand([member], searchCommand)).toBeUndefined();
  });

  it('a different modifier is not a match', () => {
    const member = createTestCommand({
      modifiers: [{ type: 'attack', value: 1 }],
    });

    const searchCommand = createTestCommand({
      modifiers: [{ type: 'speed', value: 1 }],
    });

    expect(findMatchingCommand([member], searchCommand)).toBeUndefined();
  });
});
