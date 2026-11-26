import { createTestUnit } from '@testing/unitHelpers';

import { createAttackApplyStateWithReverse } from './attackApplyStateWithReverse';

/** A blow that reached Reverse alone: the reverse is open, the rest bypassed. */
describe('createAttackApplyStateWithReverse function', () => {
  it('reports the reverse threshold met and opens the reverse', () => {
    const unit = createTestUnit('black');

    const apply = createAttackApplyStateWithReverse(unit);

    expect(apply.attackResult.unitReversed).toBe(true);
    // The substep names the unit; its square comes from the board later.
    expect(apply.reverseState).toMatchObject({ reversingUnit: unit });
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
  });
});
