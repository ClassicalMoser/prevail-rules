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

  it('answers bypassed when the attack applied no rout', () => {
    // The threshold went unmet, or a rout superseded this step. Either way the
    // rules apply no rout here, and that is an answer rather than a fault.
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
    );

    expect(getRoutStateFromAttackApply(apply)).toBe('bypassed');
  });

  it('throws when the rout is due and has not been opened', () => {
    // A pending slot means the sequencer owes an opener, so a caller asking
    // for the substep now is out of order.
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
      { routState: 'pending' },
    );

    expect(() => getRoutStateFromAttackApply(apply)).toThrow(
      'The rout on this attack apply has not been opened yet',
    );
  });
});
