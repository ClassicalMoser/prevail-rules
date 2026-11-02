import {
  createAttackApplyState,
  createRoutState,
  createTestUnit,
} from '@testing';

import { getRoutStateFromAttackApply } from './getRoutStateFromAttackApply';

describe('getRoutStateFromAttackApply function', () => {
  it('returns the rout on the attack apply', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const rout = createRoutState('black', unit, { numberToDiscard: 1 });
    const apply = createAttackApplyState(unit, {
      attackResult: {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: true,
      },
      routState: rout,
    });

    expect(getRoutStateFromAttackApply(apply)).toBe(rout);
  });

  it('throws when the attack apply has no rout', () => {
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
      { routState: 'pending' },
    );

    expect(() => getRoutStateFromAttackApply(apply)).toThrow(
      'No rout state found in attack apply state',
    );
  });
});
