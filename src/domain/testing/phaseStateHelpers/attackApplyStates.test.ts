import { isOpenSubstep } from '@queries';
import { createUnitWithPlacement, legalRetreatsOf } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
} from './attackApplyStates';

/**
 * CreateAttackApplyState: Creates an AttackApplyState with sensible defaults.
 */
describe('createAttackApplyStateWithNothingDue function', () => {
  it('given context, returns attackApply substep with defending unit and default result', () => {
    const unit = createTestUnit('black');
    const state = createAttackApplyStateWithNothingDue(unit);
    expect(state.substepType).toBe('attackApply');
    expect(state.defendingUnit).toBe(unit);
    expect(state.attackResult.unitRouted).toBe(false);
    expect(state.attackResult.unitRetreated).toBe(false);
    expect(state.attackResult.unitReversed).toBe(false);
    expect(state.completed).toBe(false);
  });

  it('given accept overrides', () => {
    const unit = createTestUnit('white');
    const state = createAttackApplyStateWithNothingDue(unit, {
      completed: true,
    });
    expect(state.completed).toBe(true);
  });
});

describe('createAttackApplyStateWithRetreat function', () => {
  it('given context, returns state with retreat result and retreatState', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createAttackApplyStateWithRetreat(
      unit,
      legalRetreatsOf(unit),
    );
    expect(state.attackResult.unitRetreated).toBe(true);
    expect(
      isOpenSubstep(state.retreatState) && state.retreatState.retreatingUnit,
    ).toBe(unit);
  });
});

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
