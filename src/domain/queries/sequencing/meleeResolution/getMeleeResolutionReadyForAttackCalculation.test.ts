import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeResolutionReadyForAttackCalculation } from './getMeleeResolutionReadyForAttackCalculation';

describe('getMeleeResolutionReadyForAttackCalculation function', () => {
  it('returns the melee slice when attack apply has not started', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, { location: 'D-4' });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeResolutionReadyForAttackCalculation(state)).toBe(melee);
  });

  it('throws when the second player commitment is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Second player commitment is still pending',
    );
  });

  it('throws when the first player commitment is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'First player commitment is still pending',
    );
  });

  it('throws when the white attack apply already exists', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('white', { attack: 2 }),
        { completed: true },
      ),
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });

  it('throws when the black attack apply already exists', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('black', { attack: 2 }),
        { completed: true },
      ),
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });
});
