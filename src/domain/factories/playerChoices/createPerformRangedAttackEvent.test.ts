import { createUnitWithPlacement } from '@testing';

import { createPerformRangedAttackEvent } from './createPerformRangedAttackEvent';

describe('createPerformRangedAttackEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const supportingUnits = [createUnitWithPlacement()];
    const targetUnit = createUnitWithPlacement({ coordinate: 'E-5' });
    const unit = createUnitWithPlacement({ coordinate: 'E-4' });

    const event = createPerformRangedAttackEvent({
      eventNumber: 3,
      player: 'white',
      supportingUnits,
      targetUnit,
      unit,
    });

    expect(event).toStrictEqual({
      choiceType: 'performRangedAttack',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
      supportingUnits,
      targetUnit,
      unit,
    });
  });
});
