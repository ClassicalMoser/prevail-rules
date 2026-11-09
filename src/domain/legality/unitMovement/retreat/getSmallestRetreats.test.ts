import { getSmallestRetreats } from './getSmallestRetreats';

/**
 * A retreat is the smallest legal fall-back: fewest turns first, then
 * fewest steps (§9.1.3). The endings are written by hand — this rule only
 * compares their costs, so where they came from does not matter.
 */
describe('getSmallestRetreats function', () => {
  it('fewer turns win even over a shorter retreat', () => {
    const smallest = getSmallestRetreats(
      new Set([
        // Two steps straight back, no turn.
        {
          flexibilityUsed: 0,
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        },
        // One step back after a turn.
        {
          flexibilityUsed: 1,
          placement: { coordinate: 'F-4', facing: 'northEast' },
          speedUsed: 1,
        },
      ]),
    );

    expect(smallest).toStrictEqual(
      new Set([{ coordinate: 'G-5', facing: 'north' }]),
    );
  });

  it('among equal turns, the fewest steps win', () => {
    const smallest = getSmallestRetreats(
      new Set([
        {
          flexibilityUsed: 0,
          placement: { coordinate: 'F-5', facing: 'north' },
          speedUsed: 1,
        },
        {
          flexibilityUsed: 0,
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        },
      ]),
    );

    expect(smallest).toStrictEqual(
      new Set([{ coordinate: 'F-5', facing: 'north' }]),
    );
  });

  it('a tie offers every smallest retreat, for the owner to choose', () => {
    const smallest = getSmallestRetreats(
      new Set([
        {
          flexibilityUsed: 1,
          placement: { coordinate: 'F-4', facing: 'northEast' },
          speedUsed: 1,
        },
        {
          flexibilityUsed: 1,
          placement: { coordinate: 'F-6', facing: 'northWest' },
          speedUsed: 1,
        },
      ]),
    );

    expect(smallest).toStrictEqual(
      new Set([
        { coordinate: 'F-4', facing: 'northEast' },
        { coordinate: 'F-6', facing: 'northWest' },
      ]),
    );
  });

  it('no legal ending means no retreat', () => {
    expect(getSmallestRetreats(new Set())).toStrictEqual(new Set());
  });
});
