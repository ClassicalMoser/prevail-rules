import { isSamePlacement } from './isSamePlacement';

/**
 * A placement is a space and a facing; two match only when both do.
 */
describe('isSamePlacement function', () => {
  it('the same space facing the same way is the same placement', () => {
    expect(
      isSamePlacement(
        { coordinate: 'E-5', facing: 'north' },
        { coordinate: 'E-5', facing: 'north' },
      ),
    ).toBe(true);
  });

  it('the same space facing another way is a different placement', () => {
    // Facing is half of where a unit stands (§2.3).
    expect(
      isSamePlacement(
        { coordinate: 'E-5', facing: 'north' },
        { coordinate: 'E-5', facing: 'northEast' },
      ),
    ).toBe(false);
  });

  it('the same facing on another space is a different placement', () => {
    expect(
      isSamePlacement(
        { coordinate: 'E-5', facing: 'north' },
        { coordinate: 'D-5', facing: 'north' },
      ),
    ).toBe(false);
  });
});
