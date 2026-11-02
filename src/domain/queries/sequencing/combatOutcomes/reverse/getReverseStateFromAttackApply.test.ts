import {
  createAttackApplyState,
  createAttackApplyStateWithReverse,
  createReverseState,
  createTestUnit,
} from '@testing';

import { getReverseStateFromAttackApply } from './getReverseStateFromAttackApply';

describe('getReverseStateFromAttackApply function', () => {
  it('returns the reverse on the attack apply', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const reverse = createReverseState({
      placement: { coordinate: 'D-4', facing: 'south' },
      unit,
    });
    const apply = createAttackApplyStateWithReverse(
      { placement: { coordinate: 'D-4', facing: 'south' }, unit },
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
