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
describe(createRetreatState, () => {
  it('given context, returns retreat substep with unit and legal options', () => {
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(unit);
    expect(state.substepType).toBe('retreat');
    expect(state.retreatingUnit).toBe(unit);
    expect(state.legalRetreatOptions.length).toBe(2);
    expect(state.completed).toBeFalsy();
  });
});

describe(createRoutState, () => {
  it('given context, returns rout substep with player and unit', () => {
    const unit = createTestUnit('white');
    const state = createRoutState('white', unit);
    expect(state.substepType).toBe('rout');
    expect(state.player).toBe('white');
    expect(state.unitsToRout.includes(unit)).toBeTruthy();
    expect(state.completed).toBeFalsy();
  });
});

describe(createReverseState, () => {
  it('given context, returns reverse substep with unit', () => {
    const unit = createUnitWithPlacement();
    const state = createReverseState(unit);
    expect(state.substepType).toBe('reverse');
    expect(state.reversingUnit).toBe(unit);
    expect(state.completed).toBeFalsy();
  });
});

describe(createRallyResolutionState, () => {
  it('given context, returns rally resolution with defaults', () => {
    const state = createRallyResolutionState();
    expect(state.playerRallied).toBeFalsy();
    expect(state.rallyResolved).toBeFalsy();
    expect(state.completed).toBeFalsy();
  });

  it('given accept overrides', () => {
    const state = createRallyResolutionState({ playerRallied: true });
    expect(state.playerRallied).toBeTruthy();
  });
});
