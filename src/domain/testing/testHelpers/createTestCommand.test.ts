import { NO_INSPIRATION_RANGE } from '@ruleValues';

import { createTestCommand } from './createTestCommand';

/** A command a spec can shape without building a whole card. */
describe('createTestCommand function', () => {
  it('orders one unit to Move, anywhere, with no bonus', () => {
    const command = createTestCommand();

    expect(command).toStrictEqual({
      modifiers: [],
      number: 1,
      restrictions: {
        inspirationRangeRestriction: NO_INSPIRATION_RANGE,
        restrictionType: 'none',
      },
      size: 'units',
      type: 'movement',
    });
  });

  it('takes the type and size a spec names', () => {
    const command = createTestCommand({
      number: 2,
      size: 'lines',
      type: 'rangedAttack',
    });

    expect(command).toMatchObject({
      number: 2,
      size: 'lines',
      type: 'rangedAttack',
    });
  });
});
