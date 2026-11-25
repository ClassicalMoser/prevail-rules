import { createTestUnit } from '@testing';

import { createPerformRangedAttackEvent } from './createPerformRangedAttackEvent';

describe('createPerformRangedAttackEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // Units are named by who they are; where they stand is the board's to say.
    const supportingUnits = [createTestUnit('white')];
    const targetUnit = createTestUnit('black');

    const event = createPerformRangedAttackEvent({
      player: 'white',
      supportingUnits,
      targetUnit,
    });

    expect(event).toStrictEqual({
      choiceType: 'performRangedAttack',
      eventType: 'playerChoice',
      player: 'white',
      supportingUnits,
      targetUnit,
    });
  });
});
