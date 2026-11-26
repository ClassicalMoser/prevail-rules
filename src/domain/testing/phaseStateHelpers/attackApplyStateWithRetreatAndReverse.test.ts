import { createUnitWithPlacement, legalRetreatsOf } from '@testing/testHelpers';

import { createAttackApplyStateWithRetreatAndReverse } from './attackApplyStateWithRetreatAndReverse';

/**
 * A blow that reached both Retreat and Reverse: the unit falls back first,
 * then turns about from wherever it ends (§7.5.4).
 */
describe('createAttackApplyStateWithRetreatAndReverse function', () => {
  it('opens the retreat and leaves the reverse due', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

    const apply = createAttackApplyStateWithRetreatAndReverse(
      unit.unit,
      legalRetreatsOf(unit),
    );

    expect(apply.attackResult).toStrictEqual({
      unitRetreated: true,
      unitReversed: true,
      unitRouted: false,
    });
    expect(apply.retreatState).toMatchObject({ retreatingUnit: unit.unit });
    // The reverse waits for the retreat to say where the unit stands.
    expect(apply.reverseState).toBe('pending');
    expect(apply.routState).toBe('bypassed');
  });
});
