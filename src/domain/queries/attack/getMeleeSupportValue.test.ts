/**
 * Melee support sums eligible neighbors. A space behind the unit does not
 * count. Engaged spaces do not count. A diagonal neighbor counts only when
 * enemies do not block both intervening spaces.
 *
 * A neighbor facing the unit adds 2. A neighbor whose flank covers the unit
 * adds 1. Other facings add nothing. Several neighbors add together.
 *
 * Board coordinates are `Letter-Number` (row-column). North is toward A,
 * south toward higher letters, east toward higher columns.
 */

import { addUnitToBoard } from '@transforms';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { getPlayerUnitWithPosition } from '@queries/unitPresence';

import { getMeleeSupportValue } from './getMeleeSupportValue';

function supportAt(
  board: ReturnType<typeof createBoardWithUnits>,
  coordinate: 'E-5' | 'A-1',
): number {
  const unit = getPlayerUnitWithPosition(board, coordinate, 'black');
  if (!unit) {
    throw new Error(`Expected a black unit at ${coordinate}`);
  }
  return getMeleeSupportValue(board, unit);
}

describe('getMeleeSupportValue function', () => {
  it('returns 0 when there are no adjacent units', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    expect(supportAt(board, 'E-5')).toBe(0);
  });

  it('returns 0 when the only friendly is behind the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    // E-5 facing north: F-5 is south, in the rear arc.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'F-5', 'north'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(0);
  });

  it('returns 0 when the adjacent unit is an enemy', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const enemyUnit = createTestUnit('white', { instanceNumber: 1 });
    // D-5 is north of E-5.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(enemyUnit, 'D-5', 'north'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(0);
  });

  it('adds 2 when an orthogonally adjacent friendly unit directly faces the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'E-6', 'west'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('adds 2 when a diagonally adjacent friendly unit directly faces the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'D-6', 'southWest'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('adds 2 when an orthogonally adjacent friendly unit indirectly faces the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'E-6', 'northWest'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('adds 2 when a diagonally adjacent friendly unit indirectly faces the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'D-6', 'west'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('adds 1 when a friendly unit flanks the unit orthogonally', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    // E-6 facing north has E-5 on its left flank.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'E-6', 'north'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(1);
  });

  it('adds 1 when a friendly unit flanks the unit diagonally', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    // D-4 facing northEast has E-5 on its right flank.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'D-4', 'northEast'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(1);
  });

  it('adds 1 when a friendly flanking unit faces opposite the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    // E-6 facing south has E-5 on its right flank.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'E-6', 'south'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(1);
  });

  it('adds nothing when the friendly unit faces indirectly away from the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'E-6', 'northEast'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(0);
  });

  it('adds nothing when the friendly unit faces directly away from the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'E-6', 'east'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(0);
  });

  it('adds nothing when enemies block both spaces of a diagonal', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const blockingEnemy1 = createTestUnit('white', { instanceNumber: 1 });
    const blockingEnemy2 = createTestUnit('white', { instanceNumber: 2 });
    // D-6 is northeast of E-5. D-5 and E-6 are the two orthogonal steps between them.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(supportUnit, 'D-6', 'southWest'),
      placed(blockingEnemy1, 'D-5', 'south'),
      placed(blockingEnemy2, 'E-6', 'south'),
    ]);
    expect(supportAt(board, 'E-5')).toBe(0);
  });

  it('only counts support from friendly units that are not engaged', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const engagedUnit = createTestUnit('black', { instanceNumber: 3 });
    const enemyUnit = createTestUnit('white', { instanceNumber: 1 });
    // Would be strong support if unit were not engaged.
    let board = createBoardWithEngagedUnits(
      engagedUnit,
      enemyUnit,
      'D-5',
      'south',
    );
    // Add the primary unit and support unit to the board.
    board = addUnitToBoard(board, placed(primaryUnit, 'E-5', 'north'));
    board = addUnitToBoard(board, placed(supportUnit, 'E-6', 'west'));

    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('counts the friendly facing the unit and ignores the one in the rear arc', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const facingSupport = createTestUnit('black', { instanceNumber: 2 });
    const rearUnit = createTestUnit('black', { instanceNumber: 3 });
    // F-5 is south of a north-facing E-5. E-6 faces west, toward E-5.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(facingSupport, 'E-6', 'west'),
      placed(rearUnit, 'F-5', 'north'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('adds weak support from each friendly whose flank covers the unit', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const weakSupportUnit1 = createTestUnit('black', { instanceNumber: 2 });
    const weakSupportUnit2 = createTestUnit('black', { instanceNumber: 3 });
    // E-6 facing north flanks E-5 from the east.
    // D-5 facing east flanks E-5 from the north.
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'north'),
      placed(weakSupportUnit1, 'E-6', 'north'),
      placed(weakSupportUnit2, 'D-5', 'east'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(2);
  });

  it('adds 2 from a friendly facing the unit at a corner', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'A-1', 'north'),
      placed(supportUnit, 'A-2', 'west'),
    ]);

    expect(supportAt(board, 'A-1')).toBe(2);
  });

  it('adds 2 from a friendly facing the unit when the unit faces that friend', () => {
    const primaryUnit = createTestUnit('black', { instanceNumber: 1 });
    const supportUnit = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([
      placed(primaryUnit, 'E-5', 'east'),
      placed(supportUnit, 'E-6', 'west'),
    ]);

    expect(supportAt(board, 'E-5')).toBe(2);
  });
});
