import { createUnitWithPlacement } from '@testing/testHelpers';
import { createReverseState } from './reverseState';

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
