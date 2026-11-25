import type { Coordinate } from '@ruleValues';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { findPlayerUnitWithPosition } from './findPlayerUnitWithPosition';

/**
 * A side's own unit on a space, and how it stands there. A space holds at
 * most one unit of each side (§2.2.1): alone, or engaged with an enemy, the
 * two facing one another.
 */
describe('findPlayerUnitWithPosition function', () => {
  it('answers undefined for an empty space', () => {
    // Nothing stands at E-5.
    const board = createEmptyStandardBoard();

    expect(findPlayerUnitWithPosition(board, 'E-5', 'black')).toBeUndefined();
  });

  it('gives a lone friendly unit, the space and the way it faces', () => {
    // A black unit alone at E-5, facing south-west.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'southWest')]);

    // The board's own unit, standing as the board holds it.
    expect(findPlayerUnitWithPosition(board, 'E-5', 'black')).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'southWest' },
      unit,
    });
  });

  it('answers undefined when the lone unit is the other side’s', () => {
    // A white unit at E-5 is no unit of black's.
    const enemy = createTestUnit('white', { attack: 3 });
    const board = createBoardWithUnits([placed(enemy, 'E-5', 'north')]);

    expect(findPlayerUnitWithPosition(board, 'E-5', 'black')).toBeUndefined();
  });

  it('gives the primary of an engaged space facing as stored', () => {
    // Black stands at E-5 facing north; White has walked into it.
    const primary = createTestUnit('black', { attack: 3 });
    const secondary = createTestUnit('white', { attack: 3 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );

    // Black is the primary, facing north.
    expect(findPlayerUnitWithPosition(board, 'E-5', 'black')).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: primary,
    });
  });

  it('gives the secondary of an engaged space facing opposite the primary', () => {
    // White stands at E-5 facing east; Black has walked into it.
    const primary = createTestUnit('white', { attack: 3 });
    const secondary = createTestUnit('black', { attack: 3 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'east',
    );

    // Engaged units face one another, so Black faces west.
    expect(findPlayerUnitWithPosition(board, 'E-5', 'black')).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'west' },
      unit: secondary,
    });
  });

  it('throws when the space is not on the board', () => {
    // 'invalid' is not a coordinate; the cast is what reaches the check.
    const board = createEmptyStandardBoard();

    expect(() =>
      findPlayerUnitWithPosition(board, 'invalid' as Coordinate, 'black'),
    ).toThrow(
      new Error('Coordinate invalid does not exist on standard board.'),
    );
  });
});
