import { createUnitWithPlacement, legalRetreatsOf } from '@testing/testHelpers';

import { createAttackApplyStateWithRetreat } from './attackApplyStateWithRetreat';

/** A blow that reached Retreat alone: the retreat is open, the rest bypassed. */
describe('createAttackApplyStateWithRetreat function', () => {
  it('opens the retreat with the paths the engine offered', () => {
    // A lone unit on E-5 facing north, open ground behind it.
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });

    const apply = createAttackApplyStateWithRetreat(
      unit.unit,
      legalRetreatsOf(unit),
    );

    expect(apply.attackResult.unitRetreated).toBe(true);
    expect(apply.retreatState).toMatchObject({
      legalRetreatPaths: [['step']],
      retreatingUnit: unit.unit,
    });
    expect(apply.reverseState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
  });
});
