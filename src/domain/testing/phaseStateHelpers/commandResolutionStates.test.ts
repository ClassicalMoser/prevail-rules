import { createEmptyGameState } from '@testing/createEmptyGameState';
import { describe, expect, it } from 'vitest';
import {
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from './commandResolutionStates';

describe('createMovementResolutionState', () => {
  it('should return movement command resolution with unit and commitment', () => {
    const state = createEmptyGameState();
    const resolution = createMovementResolutionState(state);
    expect(resolution.commandResolutionType).toBe('movement');
    expect(resolution.substepType).toBe('commandResolution');
    expect(resolution.movingUnit.placement.coordinate).toBe('E-5');
    expect(resolution.commitment.commitmentType).toBe('completed');
    expect(resolution.completed).toBe(false);
  });
});

describe('createRangedAttackResolutionState', () => {
  it('should return rangedAttack command resolution with commitments', () => {
    const state = createEmptyGameState();
    const resolution = createRangedAttackResolutionState(state);
    expect(resolution.commandResolutionType).toBe('rangedAttack');
    expect(resolution.substepType).toBe('commandResolution');
    expect(resolution.attackingCommitment.commitmentType).toBe('completed');
    expect(resolution.defendingCommitment.commitmentType).toBe('completed');
    expect(resolution.completed).toBe(false);
  });
});

describe('createMeleeResolutionState', () => {
  it('should return melee resolution with location and commitments', () => {
    const state = createEmptyGameState();
    const resolution = createMeleeResolutionState(state);
    expect(resolution.substepType).toBe('meleeResolution');
    expect(resolution.location).toBe('E-5');
    expect(resolution.whiteCommitment.commitmentType).toBe('completed');
    expect(resolution.blackCommitment.commitmentType).toBe('completed');
    expect(resolution.completed).toBe(false);
  });
});
