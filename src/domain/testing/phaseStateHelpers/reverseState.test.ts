import { createTestUnit } from '@testing/unitHelpers';

import { createReverseState } from './reverseState';

/** A unit due to turn about where it stands (§9.2). */
describe('createReverseState function', () => {
  it('holds the reversing unit by identity, without a placement', () => {
    const unit = createTestUnit('black');

    const reverse = createReverseState(unit);

    expect(reverse.substepType).toBe('reverse');
    // Where the unit stands is read from the board when the reverse resolves.
    expect(reverse.reversingUnit).toBe(unit);
    expect(reverse.completed).toBe(false);
  });
});
