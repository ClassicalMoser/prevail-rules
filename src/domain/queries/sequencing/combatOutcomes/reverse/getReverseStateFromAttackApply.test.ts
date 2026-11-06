import {
  createAttackApplyState,
  createAttackApplyStateWithReverse,
  createReverseState,
  createTestUnit,
  placed,
} from '@testing';

import { getReverseStateFromAttackApply } from './getReverseStateFromAttackApply';

describe('getReverseStateFromAttackApply function', () => {
  it('returns the reverse on the attack apply', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const reverse = createReverseState(placed(unit, 'D-4', 'south'));
    const apply = createAttackApplyStateWithReverse(
      placed(unit, 'D-4', 'south'),
      { reverseState: reverse },
    );

    expect(getReverseStateFromAttackApply(apply)).toBe(reverse);
  });

  it('throws when the attack apply has no reverse', () => {
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
      { reverseState: 'pending' },
    );

    expect(() => getReverseStateFromAttackApply(apply)).toThrow(
      'No reverse state found in attack apply state',
    );
  });
});
