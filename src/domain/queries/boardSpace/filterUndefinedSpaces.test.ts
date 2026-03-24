import type { StandardBoardCoordinate } from '@entities';
import { describe, expect, it } from 'vitest';
import { filterUndefinedSpaces } from './filterUndefinedSpaces';

/**
 * filterUndefinedSpaces: narrows a coordinate set by dropping undefined entries (Set typing allows undefined).
 */
describe('filterUndefinedSpaces', () => {
  it('given set includes undefined, returns only defined coordinates', () => {
    const spaces = new Set<StandardBoardCoordinate | undefined>([
      'A-1',
      'A-2',
      undefined,
      'A-3',
    ]) as Set<StandardBoardCoordinate>;
    expect(filterUndefinedSpaces(spaces)).toEqual(
      new Set(['A-1', 'A-2', 'A-3']),
    );
  });
});
