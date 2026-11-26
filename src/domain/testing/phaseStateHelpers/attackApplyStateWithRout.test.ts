import { createTestUnit } from '@testing/unitHelpers';

import { createAttackApplyStateWithRout } from './attackApplyStateWithRout';

/** A blow that reached Rout alone: the rout is open for the unit's owner (§9.3). */
describe('createAttackApplyStateWithRout function', () => {
  it('opens the rout of the defender for its own player', () => {
    const unit = createTestUnit('white');

    const apply = createAttackApplyStateWithRout(unit);

    expect(apply.attackResult.unitRouted).toBe(true);
    expect(apply.routState).toMatchObject({
      player: 'white',
      unitsToRout: [unit],
    });
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
  });
});
