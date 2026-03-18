import { describe, expect, it } from 'vitest';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createRearEngagementState,
} from './engagementStates';

describe('createFrontEngagementState', () => {
  it('should return engagement state with front resolution', () => {
    const state = createFrontEngagementState();
    expect(state.substepType).toBe('engagementResolution');
    expect(state.engagementResolutionState.engagementType).toBe('front');
    expect(
      state.engagementResolutionState.defensiveCommitment.commitmentType,
    ).toBe('pending');
    expect(state.completed).toBe(false);
  });
});

describe('createFlankEngagementState', () => {
  it('should return engagement state with flank resolution', () => {
    const state = createFlankEngagementState();
    expect(state.engagementResolutionState.engagementType).toBe('flank');
    expect(state.engagementResolutionState.defenderRotated).toBe(false);
    expect(state.completed).toBe(false);
  });
});

describe('createRearEngagementState', () => {
  it('should return engagement state with rear resolution and rout state', () => {
    const state = createRearEngagementState();
    expect(state.engagementResolutionState.engagementType).toBe('rear');
    expect(state.engagementResolutionState.routState).toBeDefined();
    expect(state.engagementResolutionState.completed).toBe(false);
    expect(state.completed).toBe(false);
  });
});
