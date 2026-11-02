import type { UnitWithPlacement } from '@entities';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createRetreatState,
  createTestUnit,
} from '@testing';

import { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  return {
    placement: { coordinate: 'E-5', facing },
    unit: createTestUnit(player, { attack: 2 }),
  };
}

describe('getRetreatStateFromAttackApply function', () => {
  it('returns the retreat on the attack apply', () => {
    const unit = placed('black', 'north');
    const retreat = createRetreatState(unit);
    const apply = createAttackApplyStateWithRetreat(unit, {
      retreatState: retreat,
    });

    expect(getRetreatStateFromAttackApply(apply)).toBe(retreat);
  });

  it('throws when the attack apply has no retreat', () => {
    const apply = createAttackApplyState(
      createTestUnit('black', { attack: 2 }),
      { retreatState: 'pending' },
    );

    expect(() => getRetreatStateFromAttackApply(apply)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});
