import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { describe, expect, it } from 'vitest';
import {
  createRallyResolutionState,
  createRetreatState,
  createReverseState,
  createRoutState,
} from './substepStates';

describe('createRetreatState', () => {
  it('should return retreat substep with unit and legal options', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(unit);
    expect(state.substepType).toBe('retreat');
    expect(state.retreatingUnit).toBe(unit);
    expect(state.legalRetreatOptions.size).toBe(2);
    expect(state.completed).toBe(false);
  });
});

describe('createRoutState', () => {
  it('should return rout substep with player and unit', () => {
    const unit = createTestUnit('white');
    const state = createRoutState('white', unit);
    expect(state.substepType).toBe('rout');
    expect(state.player).toBe('white');
    expect(state.unitsToRout.has(unit)).toBe(true);
    expect(state.completed).toBe(false);
  });
});

describe('createReverseState', () => {
  it('should return reverse substep with unit', () => {
    const unit = createUnitWithPlacement();
    const state = createReverseState(unit);
    expect(state.substepType).toBe('reverse');
    expect(state.reversingUnit).toBe(unit);
    expect(state.completed).toBe(false);
  });
});

describe('createRallyResolutionState', () => {
  it('should return rally resolution with defaults', () => {
    const state = createRallyResolutionState();
    expect(state.playerRallied).toBe(false);
    expect(state.rallyResolved).toBe(false);
    expect(state.completed).toBe(false);
  });

  it('should accept overrides', () => {
    const state = createRallyResolutionState({ playerRallied: true });
    expect(state.playerRallied).toBe(true);
  });
});
