import { createTestUnit } from '@testing/unitHelpers';

import { placed } from './placed';

/** A unit a spec already has, put at the space and facing it chooses. */
describe('placed function', () => {
  it('puts that very unit on the space, facing the way given', () => {
    const unit = createTestUnit('white');

    const withPlacement = placed(unit, 'D-4', 'southWest');

    expect(withPlacement).toStrictEqual({
      placement: { coordinate: 'D-4', facing: 'southWest' },
      unit,
    });
    expect(withPlacement.unit).toBe(unit);
  });
});
