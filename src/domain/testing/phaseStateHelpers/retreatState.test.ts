import {
  createUnitWithPlacement,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing/testHelpers';
import { createRetreatState } from './retreatState';

/**
 * A retreat substep records the paths the engine offered the unit (§9.1),
 * open and with none chosen; a unit with nowhere to go owes a rout instead
 * (§9.1.6).
 */
describe('createRetreatState function', () => {
  it('records the unit and the paths it is offered, with no rout due', () => {
    // A lone unit on E-5 facing north, open ground behind it.
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(unit.unit, legalRetreatsOf(unit));

    expect(state.substepType).toBe('retreat');
    expect(state.retreatingUnit).toBe(unit.unit);
    // It can fall straight back one space, and nothing smaller.
    expect(state.legalRetreatPaths).toStrictEqual([['step']]);
    // One legal retreat is not a choice: it is carried out as it stands.
    expect(state.chosenRetreatPath).toStrictEqual(['step']);
    // Somewhere to go: it will not rout.
    expect(state.routState).toBe('bypassed');
    expect(state.completed).toBe(false);
  });

  it('leaves a rout due when the unit has nowhere to retreat', () => {
    // An enemy right behind the unit, facing it, cuts its retreat (§9.1.5).
    const unit = createUnitWithPlacement({ coordinate: 'E-5' });
    const state = createRetreatState(
      unit.unit,
      legalRetreatsOf(unit, [enemyCuttingOffRetreat(unit)]),
    );

    expect(state.legalRetreatPaths).toStrictEqual([]);
    // The rout waits to be opened in the retreat's place.
    expect(state.routState).toBe('pending');
  });
});
