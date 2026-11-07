import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import {
  createRallyResolutionState,
  createRetreatState,
  createReverseState,
  createRoutState,
} from './substepStates';

/**
 * CreateRetreatState: Creates a RetreatState with sensible defaults.
 */
describe('createRetreatState function', () => {
  it('given context, returns retreat substep with unit and legal options', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(unit);
    expect(state.substepType).toBe('retreat');
    expect(state.retreatingUnit).toBe(unit);
    expect(state.legalRetreatOptions).toHaveLength(2);
    expect(state.completed).toBe(false);
  });
});

describe('createRoutState function', () => {
  it('given context, returns rout substep with player and unit', () => {
    const unit = createTestUnit('white');
    const state = createRoutState('white', unit);
    expect(state.substepType).toBe('rout');
    expect(state.player).toBe('white');
    expect(state.unitsToRout).toContain(unit);
    expect(state.completed).toBe(false);
  });
});

describe('createReverseState function', () => {
  it('holds the reversing unit by identity, without a placement', () => {
    const unit = createUnitWithPlacement();
    const state = createReverseState(unit.unit);
    expect(state.substepType).toBe('reverse');
    // Where the unit stands is read from the board when the reverse resolves.
    expect(state.reversingUnit).toBe(unit.unit);
    expect(state.completed).toBe(false);
  });
});

describe('createRallyResolutionState function', () => {
  it('given context, returns rally resolution with defaults', () => {
    const state = createRallyResolutionState();
    expect(state.playerRallied).toBe(false);
    expect(state.rallyResolved).toBe(false);
    expect(state.completed).toBe(false);
  });

  it('given accept overrides', () => {
    const state = createRallyResolutionState({ playerRallied: true });
    expect(state.playerRallied).toBe(true);
  });
});
