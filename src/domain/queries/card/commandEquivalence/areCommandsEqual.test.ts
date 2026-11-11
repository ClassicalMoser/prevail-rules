import { createTestCommand } from '@testing';

import { areCommandsEqual } from './areCommandsEqual';

describe('areCommandsEqual function', () => {
  it('holds for two copies of one command written out separately', () => {
    const command = createTestCommand();

    expect(areCommandsEqual(command, structuredClone(command))).toBe(true);
  });

  it('fails when the number of orders differs', () => {
    const command = createTestCommand();

    expect(
      areCommandsEqual(command, { ...command, number: command.number + 1 }),
    ).toBe(false);
  });

  it('fails when the commands carry different modifiers', () => {
    const command = createTestCommand();

    expect(
      areCommandsEqual(command, {
        ...command,
        modifiers: [...command.modifiers, { type: 'attack', value: 1 }],
      }),
    ).toBe(false);
  });
});
