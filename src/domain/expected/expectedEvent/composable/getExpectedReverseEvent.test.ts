import { createReverseState, createUnitWithPlacement } from '@testing';

import { getExpectedReverseEvent } from './getExpectedReverseEvent';

/**
 * GetExpectedReverseEvent: next reverse-resolution event from reverse substate.
 */
describe('getExpectedReverseEvent function', () => {
  const unitPlacement = createUnitWithPlacement();

  it('given resolve reverse when the unit has not turned yet', () => {
    // The reverse is due and the unit has not turned.
    const reverseState = createReverseState(unitPlacement.unit);

    // The turn is the engine's to make.

    expect(getExpectedReverseEvent(reverseState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveReverse',
    });
  });

  it('given when the reverse is already complete, throws', () => {
    const reverseState = createReverseState(unitPlacement.unit, {
      completed: true,
    });

    expect(() => getExpectedReverseEvent(reverseState)).toThrow(
      'Reverse state is already complete',
    );
  });
});
