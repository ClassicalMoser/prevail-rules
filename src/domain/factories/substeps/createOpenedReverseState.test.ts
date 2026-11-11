import { createTestUnit } from '@testing';

import { createOpenedReverseState } from './createOpenedReverseState';

/** A reversed unit is turned about where it stands (§9.2). */
describe('createOpenedReverseState function', () => {
  it('opens a reverse for the unit, with where it ends not yet worked out', () => {
    const unit = createTestUnit('white', { attack: 2 });

    expect(createOpenedReverseState(unit)).toStrictEqual({
      completed: false,
      finalPosition: 'pending',
      reversingUnit: unit,
      substepType: 'reverse',
    });
  });
});
