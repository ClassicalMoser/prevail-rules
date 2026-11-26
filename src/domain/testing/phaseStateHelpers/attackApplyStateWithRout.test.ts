import { isOpenSubstep } from '@queries';
import { createTestUnit } from '@testing/unitHelpers';
import { createAttackApplyStateWithRout } from './attackApplyStateWithRout';

describe('createAttackApplyStateWithRout function', () => {
  it('given context, returns state with rout result and routState', () => {
    const unit = createTestUnit('white');
    const state = createAttackApplyStateWithRout(unit);
    expect(state.attackResult.unitRouted).toBe(true);
    expect(
      isOpenSubstep(state.routState) &&
        state.routState.unitsToRout.includes(unit),
    ).toBe(true);
  });
});
