import {
  coordinatesOfLines,
  createBoardWithFacingRow,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';

import { getLinesFromUnit } from './getLinesFromUnit';

/**
 * Placement check, then the segment, then the windows for that unit. Join
 * rules, segment growth, index lookup, and window math live in their own suites.
 */
describe('getLinesFromUnit function', () => {
  it('throws when the unit is not at the reported coordinate', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);
    const reportedElsewhere = placed(unit, 'A-1', 'north');

    expect(() => getLinesFromUnit(board, reportedElsewhere)).toThrow(
      'Unit is not at reported placement',
    );
  });

  it('wires the segment and windows for a short row', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'E-6'],
    });

    const lines = getLinesFromUnit(board, unitAt('E-5'));

    expect(coordinatesOfLines(lines)).toStrictEqual([['E-5', 'E-6']]);
  });

  it('wires the windows when the segment is longer than eight', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: [
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
      ],
    });

    const lines = getLinesFromUnit(board, unitAt('E-5'));
    const windows = coordinatesOfLines(lines);

    expect(windows).toHaveLength(3);
    expect(windows[0]).toHaveLength(8);
  });
});
