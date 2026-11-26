import { createTestUnit } from '@testing/unitHelpers';
import { createAttackApplyStateWithNothingDue } from './attackApplyStateWithNothingDue';

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
