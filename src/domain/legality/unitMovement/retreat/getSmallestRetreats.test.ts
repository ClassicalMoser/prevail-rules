import { getSmallestRetreats } from './getSmallestRetreats';

/**
 * A retreat is the smallest legal fall-back: fewest turns first, then
 * fewest steps (§9.1.3). The endings are written by hand, each a fall-back
 * from E-5 facing north; this rule only compares their costs.
 */
describe('getSmallestRetreats function', () => {
  it('fewer turns win even over a shorter retreat', () => {
    const smallest = getSmallestRetreats(
      new Set([
        // Two steps straight back, no turn.
        {
          flexibilityUsed: 0,
          path: ['step', 'step'],
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        },
        // One step back after a turn.
        {
          flexibilityUsed: 1,
          path: ['turnRight', 'step'],
          placement: { coordinate: 'F-4', facing: 'northEast' },
          speedUsed: 1,
        },
      ]),
    );

    expect(smallest).toStrictEqual([['step', 'step']]);
  });

  it('among equal turns, the fewest steps win', () => {
    const smallest = getSmallestRetreats(
      new Set([
        {
          flexibilityUsed: 0,
          path: ['step'],
          placement: { coordinate: 'F-5', facing: 'north' },
          speedUsed: 1,
        },
        {
          flexibilityUsed: 0,
          path: ['step', 'step'],
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        },
      ]),
    );

    expect(smallest).toStrictEqual([['step']]);
  });

  it('a tie offers every smallest retreat, for the owner to choose', () => {
    const smallest = getSmallestRetreats(
      new Set([
        {
          flexibilityUsed: 1,
          path: ['turnRight', 'step'],
          placement: { coordinate: 'F-4', facing: 'northEast' },
          speedUsed: 1,
        },
        {
          flexibilityUsed: 1,
          path: ['turnLeft', 'step'],
          placement: { coordinate: 'F-6', facing: 'northWest' },
          speedUsed: 1,
        },
      ]),
    );

    // Each is offered by the path that reaches it, so the choice is made, and
    // recorded, by path.
    expect(smallest).toStrictEqual([
      ['turnRight', 'step'],
      ['turnLeft', 'step'],
    ]);
  });

  it('two equally small ways to the same space are one retreat', () => {
    // §9.1.3: the choice is about where the unit ends. Two endings of equal
    // cost on the same space, written by hand with different paths (this rule
    // reads costs and endings, not geometry): the first found is kept, and no
    // choice is offered between them.
    const smallest = getSmallestRetreats(
      new Set([
        {
          flexibilityUsed: 2,
          path: ['turnLeft', 'step', 'turnRight', 'step'],
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        },
        {
          flexibilityUsed: 2,
          path: ['step', 'turnLeft', 'step', 'turnRight'],
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        },
      ]),
    );

    expect(smallest).toStrictEqual([['turnLeft', 'step', 'turnRight', 'step']]);
  });

  it('no legal ending means no retreat', () => {
    expect(getSmallestRetreats(new Set())).toStrictEqual([]);
  });
});
