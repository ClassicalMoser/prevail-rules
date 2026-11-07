import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeAttackApplyState } from './getMeleeAttackApplyState';

describe('getMeleeAttackApplyState function', () => {
  it('returns the white attack apply', () => {
    const empty = createEmptyGameState('standard');
    const apply = createAttackApplyState(
      createTestUnit('white', { attack: 2 }),
      { completed: true },
    );
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: apply,
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeAttackApplyState(state, 'white')).toBe(apply);
  });

  it('returns the black attack apply', () => {
    const empty = createEmptyGameState('standard');
    const apply = createAttackApplyStateWithRout(
      createTestUnit('black', { attack: 2 }),
    );
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: apply,
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeAttackApplyState(state, 'black')).toBe(apply);
  });

  it('throws when the white attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: 'pending',
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeAttackApplyState(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});
