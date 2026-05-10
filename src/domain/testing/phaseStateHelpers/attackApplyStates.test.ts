import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
} from './attackApplyStates';

/**
 * CreateAttackApplyState: Creates an AttackApplyState with sensible defaults.
 */
describe(createAttackApplyState, () => {
  it('given context, returns attackApply substep with defending unit and default result', () => {
    const unit = createTestUnit('black');
    const state = createAttackApplyState(unit);
    expect(state.substepType).toBe('attackApply');
    expect(state.defendingUnit).toBe(unit);
    expect(state.attackResult.unitRouted).toBeFalsy();
    expect(state.attackResult.unitRetreated).toBeFalsy();
    expect(state.attackResult.unitReversed).toBeFalsy();
    expect(state.completed).toBeFalsy();
  });

  it('given accept overrides', () => {
    const unit = createTestUnit('white');
    const state = createAttackApplyState(unit, { completed: true });
    expect(state.completed).toBeTruthy();
  });
});

describe(createAttackApplyStateWithRetreat, () => {
  it('given context, returns state with retreat result and retreatState', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createAttackApplyStateWithRetreat(unit);
    expect(state.attackResult.unitRetreated).toBeTruthy();
    expect(state.retreatState?.retreatingUnit).toBe(unit);
  });
});

describe(createAttackApplyStateWithRout, () => {
  it('given context, returns state with rout result and routState', () => {
    const unit = createTestUnit('white');
    const state = createAttackApplyStateWithRout(unit);
    expect(state.attackResult.unitRouted).toBeTruthy();
    expect(state.routState?.unitsToRout.has(unit)).toBeTruthy();
  });
});

describe(createAttackApplyStateWithReverse, () => {
  it('given context, returns state with reverse result and reverseState', () => {
    const unit = createUnitWithPlacement();
    const state = createAttackApplyStateWithReverse(unit);
    expect(state.attackResult.unitReversed).toBeTruthy();
    expect(state.reverseState?.reversingUnit).toBe(unit);
  });
});
