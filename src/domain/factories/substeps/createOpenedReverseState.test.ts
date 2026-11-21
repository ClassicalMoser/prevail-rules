import { createTestUnit } from '@testing';

import { createOpenedReverseState } from './createOpenedReverseState';

/** A reversed unit is turned about where it stands (§9.2). */
describe('createOpenedReverseState function', () => {
  it('opens a reverse for the unit, not yet turned', () => {
    const unit = createTestUnit('white', { attack: 2 });

    expect(createOpenedReverseState(unit)).toStrictEqual({
      completed: false,
      reversingUnit: unit,
      substepType: 'reverse',
    });
  });
});
