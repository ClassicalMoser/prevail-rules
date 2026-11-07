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
    const reverse = createReverseState(unit);
    const apply = createAttackApplyStateWithReverse(unit, {
      reverseState: reverse,
    });

    expect(getReverseStateFromAttackApply(apply)).toBe(reverse);
  });

  it('answers bypassed when the attack applied no reverse', () => {
    // The threshold went unmet, or a rout superseded this step. Either way the
    // rules apply no reverse here, and that is an answer rather than a fault.
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
    );

    expect(getReverseStateFromAttackApply(apply)).toBe('bypassed');
  });

  it('throws when the reverse is due and has not been opened', () => {
    // A pending slot means the sequencer owes an opener, so a caller asking
    // for the substep now is out of order.
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
      { reverseState: 'pending' },
    );

    expect(() => getReverseStateFromAttackApply(apply)).toThrow(
      'The reverse on this attack apply has not been opened yet',
    );
  });
});
