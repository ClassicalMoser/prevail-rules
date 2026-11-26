import { isOpenSubstep } from '@queries';
import { createUnitWithPlacement } from '@testing/testHelpers';
import { createAttackApplyStateWithReverse } from './attackApplyStateWithReverse';

describe('createAttackApplyStateWithReverse function', () => {
  it('reports the reverse threshold met and opens the reverse', () => {
    const unit = createUnitWithPlacement();
    const state = createAttackApplyStateWithReverse(unit.unit);
    expect(state.attackResult.unitReversed).toBe(true);
    // The substep names the unit; its square comes from the board later.
    expect(
      isOpenSubstep(state.reverseState) && state.reverseState.reversingUnit,
    ).toBe(unit.unit);
  });
});
