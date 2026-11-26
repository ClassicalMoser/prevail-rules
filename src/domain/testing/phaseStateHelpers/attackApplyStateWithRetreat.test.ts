import { isOpenSubstep } from '@queries';
import { createUnitWithPlacement, legalRetreatsOf } from '@testing/testHelpers';
import { createAttackApplyStateWithRetreat } from './attackApplyStateWithRetreat';

describe('createAttackApplyStateWithRetreat function', () => {
  it('given context, returns state with retreat result and retreatState', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createAttackApplyStateWithRetreat(
      unit.unit,
      legalRetreatsOf(unit),
    );
    expect(state.attackResult.unitRetreated).toBe(true);
    expect(
      isOpenSubstep(state.retreatState) && state.retreatState.retreatingUnit,
    ).toBe(unit.unit);
  });
});
