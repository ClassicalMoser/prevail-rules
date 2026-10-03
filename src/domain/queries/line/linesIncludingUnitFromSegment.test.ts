import type { UnitWithPlacement } from '@entities';
import { coordinatesOfLines, createUnitWithPlacement } from '@testing';

import { linesIncludingUnitFromSegment } from './linesIncludingUnitFromSegment';

/** A north-facing segment along `coordinates`, one unit per space. */
function segmentAlong(
  coordinates: readonly UnitWithPlacement['placement']['coordinate'][],
): UnitWithPlacement[] {
  const segment = coordinates.map((coordinate, index) => {
    const withPlacement = createUnitWithPlacement({
      coordinate,
      facing: 'north',
      unitOptions: { attack: 3, instanceNumber: index + 1 },
    });
    return withPlacement;
  });
  return segment;
}

/**
 * A short segment is one line. A longer segment yields every eight-unit window
 * that still contains the given unit.
 */
describe(linesIncludingUnitFromSegment, () => {
  it('a segment of one is one line of one', () => {
    const segment = segmentAlong(['E-5']);
    const unit = segment[0];
    if (unit === undefined) {
      throw new Error('Expected a unit');
    }

    const lines = linesIncludingUnitFromSegment(segment, unit);

    expect(coordinatesOfLines(lines)).toEqual([['E-5']]);
  });

  it('a segment of eight is one line of eight', () => {
    const segment = segmentAlong([
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
    ]);
    const unit = segment[4];
    if (unit === undefined) {
      throw new Error('Expected a unit');
    }

    const lines = linesIncludingUnitFromSegment(segment, unit);

    expect(coordinatesOfLines(lines)).toEqual([
      ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8'],
    ]);
  });

  it('a unit inside a segment of ten yields three lines of eight', () => {
    const segment = segmentAlong([
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
      'E-9',
      'E-10',
    ]);
    const unit = segment[4];
    if (unit === undefined) {
      throw new Error('Expected a unit');
    }

    // E-5 is in the middle. Windows that include it start at 0, 1, and 2.
    const lines = linesIncludingUnitFromSegment(segment, unit);

    expect(coordinatesOfLines(lines)).toEqual([
      ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8'],
      ['E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'],
      ['E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'E-10'],
    ]);
  });

  it('a unit at the west end of a segment of ten yields one line', () => {
    const segment = segmentAlong([
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
      'E-9',
      'E-10',
    ]);
    const unit = segment[0];
    if (unit === undefined) {
      throw new Error('Expected a unit');
    }

    const lines = linesIncludingUnitFromSegment(segment, unit);

    expect(coordinatesOfLines(lines)).toEqual([
      ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8'],
    ]);
  });
});
