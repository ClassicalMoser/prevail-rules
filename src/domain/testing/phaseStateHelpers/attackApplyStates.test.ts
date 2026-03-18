import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { describe, expect, it } from 'vitest';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
} from './attackApplyStates';

describe('createAttackApplyState', () => {
  it('should return attackApply substep with defending unit and default result', () => {
    const unit = createTestUnit('black');
    const state = createAttackApplyState(unit);
    expect(state.substepType).toBe('attackApply');
    expect(state.defendingUnit).toBe(unit);
    expect(state.attackResult.unitRouted).toBe(false);
    expect(state.attackResult.unitRetreated).toBe(false);
    expect(state.attackResult.unitReversed).toBe(false);
    expect(state.completed).toBe(false);
  });

  it('should accept overrides', () => {
    const unit = createTestUnit('white');
    const state = createAttackApplyState(unit, { completed: true });
    expect(state.completed).toBe(true);
  });
});

describe('createAttackApplyStateWithRetreat', () => {
  it('should return state with retreat result and retreatState', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createAttackApplyStateWithRetreat(unit);
    expect(state.attackResult.unitRetreated).toBe(true);
    expect(state.retreatState?.retreatingUnit).toBe(unit);
  });
});

describe('createAttackApplyStateWithRout', () => {
  it('should return state with rout result and routState', () => {
    const unit = createTestUnit('white');
    const state = createAttackApplyStateWithRout(unit);
    expect(state.attackResult.unitRouted).toBe(true);
    expect(state.routState?.unitsToRout.has(unit)).toBe(true);
  });
});

describe('createAttackApplyStateWithReverse', () => {
  it('should return state with reverse result and reverseState', () => {
    const unit = createUnitWithPlacement();
    const state = createAttackApplyStateWithReverse(unit);
    expect(state.attackResult.unitReversed).toBe(true);
    expect(state.reverseState?.reversingUnit).toBe(unit);
  });
});
