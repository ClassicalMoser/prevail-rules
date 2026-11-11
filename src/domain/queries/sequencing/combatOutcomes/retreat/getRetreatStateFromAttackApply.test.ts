import type { UnitWithPlacement } from '@entities';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
} from '@testing';

import { createUnitPlacement } from '@factories';

import { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  const unit = createTestUnit(player, { attack: 2 });
  const placement = createUnitPlacement('E-5', facing);
  const standing = { placement, unit };
  return standing;
}

describe('getRetreatStateFromAttackApply function', () => {
  it('returns the retreat on the attack apply', () => {
    const unit = placed('black', 'north');
    const retreat = createRetreatState(unit, legalRetreatsOf(unit));
    const apply = createAttackApplyStateWithRetreat(
      unit,
      legalRetreatsOf(unit),
      {
        retreatState: retreat,
      },
    );

    expect(getRetreatStateFromAttackApply(apply)).toBe(retreat);
  });

  it('answers bypassed when the attack applied no retreat', () => {
    // The threshold went unmet, or a rout superseded this step. Either way the
    // rules apply no retreat here, and that is an answer rather than a fault.
    const apply = createAttackApplyStateWithNothingDue(
      createTestUnit('black', { attack: 2 }),
    );

    expect(getRetreatStateFromAttackApply(apply)).toBe('bypassed');
  });

  it('throws when the retreat is due and has not been opened', () => {
    // A pending slot means the sequencer owes an opener, so a caller asking
    // for the substep now is out of order.
    const apply = createAttackApplyStateWithNothingDue(
      createTestUnit('black', { attack: 2 }),
      { retreatState: 'pending' },
    );

    expect(() => getRetreatStateFromAttackApply(apply)).toThrow(
      'The retreat on this attack apply has not been opened yet',
    );
  });
});
