import type { Command } from '@entities';

import { toRemainingCommands } from './toRemainingCommands';

/**
 * ToRemainingCommands: lines ×N become N issuable number:1 slots; units stay one grant.
 */
describe(toRemainingCommands, () => {
  const lineBase: Command = {
    modifiers: [{ type: 'attack', value: 1 }],
    number: 2,
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    size: 'lines',
    type: 'movement',
  };

  it('expands lines ×N into N distinct number:1 slots', () => {
    const slots = toRemainingCommands(lineBase);

    expect(slots).toHaveLength(2);
    expect(slots[0]).toStrictEqual({ ...lineBase, number: 1 });
    expect(slots[1]).toStrictEqual({ ...lineBase, number: 1 });
    expect(slots[0]).not.toBe(slots[1]);
  });

  it('given lines ×1, returns a single number:1 slot', () => {
    const oneLine: Command = { ...lineBase, number: 1 };

    expect(toRemainingCommands(oneLine)).toStrictEqual([oneLine]);
  });

  it('leaves units ×N as a single remaining command', () => {
    const unitsTwo: Command = {
      ...lineBase,
      number: 2,
      size: 'units',
    };

    expect(toRemainingCommands(unitsTwo)).toStrictEqual([unitsTwo]);
  });
});
