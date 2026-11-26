import { createUnitPlacement } from '@factories';

import { hasMove } from './hasMove';

/** Whether a unit may end its move on a space, in a facing when one is named. */
describe('hasMove function', () => {
  // A unit's legal endings: on E-5 facing north, and on E-6 facing south.
  const endings = new Set([
    { placement: createUnitPlacement('E-5', 'north') },
    { placement: createUnitPlacement('E-6', 'south') },
  ]);

  it('finds a move ending on that space in that facing', () => {
    expect(hasMove(endings, 'E-6', 'south')).toBe(true);
  });

  it('finds a move ending on that space in any facing when none is named', () => {
    expect(hasMove(endings, 'E-5')).toBe(true);
  });

  it('finds no move ending on a space none reaches', () => {
    expect(hasMove(endings, 'E-7')).toBe(false);
  });

  it('finds no move ending on the space in another facing', () => {
    expect(hasMove(endings, 'E-5', 'south')).toBe(false);
  });
});
