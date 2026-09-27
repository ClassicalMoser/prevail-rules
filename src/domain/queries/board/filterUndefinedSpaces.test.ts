import type { Coordinate } from '@entities';

import { filterUndefinedSpaces } from './filterUndefinedSpaces';

/**
 * FilterUndefinedSpaces: narrows a coordinate set by dropping undefined entries (Set typing allows undefined).
 */
describe(filterUndefinedSpaces, () => {
  it('given set includes undefined, returns only defined coordinates', () => {
    const spaces = new Set<Coordinate | undefined>([
      'A-1',
      'A-2',
      undefined,
      'A-3',
    ]) as Set<Coordinate>;
    expect(filterUndefinedSpaces(spaces)).toStrictEqual(
      new Set(['A-1', 'A-2', 'A-3']),
    );
  });
});
