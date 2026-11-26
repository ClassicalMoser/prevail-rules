import { createTestUnit } from '@testing/unitHelpers';

import { createAttackApplyStateWithNothingDue } from './attackApplyStateWithNothingDue';

/** A blow that reached no threshold leaves the defender as it stood (§7.5.1). */
describe('createAttackApplyStateWithNothingDue function', () => {
  it('owes no retreat, reverse or rout', () => {
    const unit = createTestUnit('black');

    const apply = createAttackApplyStateWithNothingDue(unit);

    expect(apply.defendingUnit).toBe(unit);
    expect(apply.attackResult).toStrictEqual({
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
    expect(apply.completed).toBe(false);
  });

  it('takes the fields a spec overrides', () => {
    const apply = createAttackApplyStateWithNothingDue(
      createTestUnit('white'),
      {
        completed: true,
      },
    );

    expect(apply.completed).toBe(true);
  });
});
