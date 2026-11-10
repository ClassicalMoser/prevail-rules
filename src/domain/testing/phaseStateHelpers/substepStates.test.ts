import {
  createUnitWithPlacement,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import {
  createRallyResolutionState,
  createRetreatState,
  createReverseState,
  createRoutState,
} from './substepStates';

/**
 * A retreat substep records the paths the engine offered the unit (§9.1),
 * open and with none chosen; a unit with nowhere to go owes a rout instead
 * (§9.1.6).
 */
describe('createRetreatState function', () => {
  it('records the unit and the paths it is offered, with no rout due', () => {
    // A lone unit on E-5 facing north, open ground behind it.
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(unit, legalRetreatsOf(unit));

    expect(state.substepType).toBe('retreat');
    expect(state.retreatingUnit).toBe(unit);
    // It can fall straight back one space, and nothing smaller.
    expect(state.legalRetreatPaths).toStrictEqual([['step']]);
    expect(state.chosenRetreatPath).toBe('pending');
    // Somewhere to go: it will not rout.
    expect(state.routState).toBe('bypassed');
    expect(state.completed).toBe(false);
  });

  it('leaves a rout due when the unit has nowhere to retreat', () => {
    // An enemy right behind the unit, facing it, cuts its retreat (§9.1.5).
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(
      unit,
      legalRetreatsOf(unit, [enemyCuttingOffRetreat(unit)]),
    );

    expect(state.legalRetreatPaths).toStrictEqual([]);
    // The rout waits to be opened in the retreat's place.
    expect(state.routState).toBe('pending');
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
