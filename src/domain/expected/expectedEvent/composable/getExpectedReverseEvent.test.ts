import { createReverseState, createUnitWithPlacement } from '@testing';

import { getExpectedReverseEvent } from './getExpectedReverseEvent';

/**
 * GetExpectedReverseEvent: next reverse-resolution event from reverse substate.
 */
describe('getExpectedReverseEvent function', () => {
  // The unit the attack reversed: black, on E-5 facing north.
  const unitPlacement = createUnitWithPlacement();

  it('an open reverse waits on the engine to turn the unit about', () => {
    // The reverse is due and the unit has not turned.
    const reverseState = createReverseState(unitPlacement.unit);

    // The turn is the engine's to make.
    // Nobody chooses anything in a reverse (§9.2.1).
    expect(getExpectedReverseEvent(reverseState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveReverse',
    });
  });

  it('a finished reverse has nothing left to ask for, so asking throws', () => {
    // The unit has already turned.
    const reverseState = createReverseState(unitPlacement.unit, {
      completed: true,
    });

    expect(() => getExpectedReverseEvent(reverseState)).toThrow(
      'Reverse state is already complete',
    );
  });
});
