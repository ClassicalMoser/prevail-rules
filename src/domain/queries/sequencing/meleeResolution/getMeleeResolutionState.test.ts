import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import {
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeResolutionState,
} from './getMeleeResolutionState';

/**
 * The melee slice on a resolve-melee phase, and that slice when both
 * commitments are done and neither attack-apply has started.
 */
describe('getMeleeResolutionState function', () => {
  it('returns the melee slice on the phase', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, { location: 'D-4' });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeResolutionState(state)).toBe(melee);
  });

  it('throws when the phase is issue commands', () => {
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('throws when the round has no phase', () => {
    const state = createEmptyGameState('standard');

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('throws when melee resolution is still pending', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionState(state)).toThrow(
      'No current melee resolution state',
    );
  });
});

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

  it('throws when the white commitment is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'White commitment is still pending',
    );
  });

  it('throws when the black commitment is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      blackCommitment: { commitmentType: 'pending' },
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Black commitment is still pending',
    );
  });

  it('throws when the white attack apply already exists', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyState(
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
      blackAttackApplyState: createAttackApplyState(
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
