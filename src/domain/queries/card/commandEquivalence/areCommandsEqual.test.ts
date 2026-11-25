import { createTestCommand } from '@testing';

import { areCommandsEqual } from './areCommandsEqual';

/**
 * A card's command is its type, its size, its number, who it may order and
 * what it gives them (§4.3.1). Two copies are the same command only when
 * every one of those agrees; each case below alters one.
 */
describe('areCommandsEqual function', () => {
  // A Move order for one unit, any unit, with no modifiers.
  const command = createTestCommand();

  it('holds for two copies of one command written out separately', () => {
    expect(areCommandsEqual(command, structuredClone(command))).toBe(true);
  });

  it('fails when one moves and the other shoots', () => {
    // A Shoot command orders units to shoot rather than move (§4.3.11).
    expect(
      areCommandsEqual(command, { ...command, type: 'rangedAttack' }),
    ).toBe(false);
  });

  it('fails when one orders units and the other lines', () => {
    // One line is a whole rank of up to eight; one unit is one (§4.3.5).
    expect(areCommandsEqual(command, { ...command, size: 'lines' })).toBe(
      false,
    );
  });

  it('fails when the number of orders differs', () => {
    // Two units is one more than the command prints.
    expect(
      areCommandsEqual(command, { ...command, number: command.number + 1 }),
    ).toBe(false);
  });

  it('fails when the commands may order different units', () => {
    // The same order reaching only formation units is a narrower order.
    expect(
      areCommandsEqual(command, {
        ...command,
        restrictions: {
          inspirationRangeRestriction: -1,
          restrictionType: 'trait',
          traitRestrictions: ['formation'],
        },
      }),
    ).toBe(false);
  });

  it('fails when the commands carry different modifiers', () => {
    // +1 Attack for every unit ordered is a stronger command (§4.3.8).
    expect(
      areCommandsEqual(command, {
        ...command,
        modifiers: [...command.modifiers, { type: 'attack', value: 1 }],
      }),
    ).toBe(false);
  });
});
