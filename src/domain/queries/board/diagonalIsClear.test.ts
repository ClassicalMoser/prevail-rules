import { createEmptyStandardBoard } from '@factories';
import { createBoardWithUnits, createTestUnit, placed } from '@testing';

import { diagonalIsClear } from './diagonalIsClear';

/**
 * A diagonal is blocked when enemy units stand in both of the orthogonal
 * spaces that flank it; one enemy does not block it (§2.4.4). This is the
 * question support and commanders ask. Friends never shut it: that stricter
 * test is the mover's alone (§5.4.5).
 *
 * Every case asks of the diagonal from E-5 north-east to D-6, which passes
 * between D-5 and E-6, with Black asking.
 */
describe('diagonalIsClear function', () => {
  // Two white units and two black ones, to stand in the corner spaces.
  const firstWhite = createTestUnit('white');
  const secondWhite = createTestUnit('white', { instanceNumber: 2 });
  const firstBlack = createTestUnit('black');
  const secondBlack = createTestUnit('black', { instanceNumber: 2 });

  it('is clear when nothing stands beside it', () => {
    // An empty board.
    const board = createEmptyStandardBoard();

    // With both corner spaces empty, nothing blocks the diagonal.
    expect(diagonalIsClear('black', board, 'E-5', 'D-6')).toBe(true);
  });

  it('stays clear with an enemy in only one of the two corner spaces', () => {
    // A white unit at D-5; E-6 is empty.
    const board = createBoardWithUnits([placed(firstWhite, 'D-5', 'north')]);

    // One enemy is not enough to shut the diagonal.
    expect(diagonalIsClear('black', board, 'E-5', 'D-6')).toBe(true);
  });

  it('is blocked with enemies in both corner spaces', () => {
    // White units at D-5 and E-6.
    const board = createBoardWithUnits([
      placed(firstWhite, 'D-5', 'north'),
      placed(secondWhite, 'E-6', 'north'),
    ]);

    // Enemies on both sides close the diagonal to Black.
    expect(diagonalIsClear('black', board, 'E-5', 'D-6')).toBe(false);
  });

  it('stays clear with friends in both corner spaces', () => {
    // Black's own units at D-5 and E-6.
    const board = createBoardWithUnits([
      placed(firstBlack, 'D-5', 'north'),
      placed(secondBlack, 'E-6', 'north'),
    ]);

    // A wall of one's own troops never cuts off support or a commander.
    expect(diagonalIsClear('black', board, 'E-5', 'D-6')).toBe(true);
  });

  it('stays clear with a friend in one corner space and an enemy in the other', () => {
    // A black unit at D-5, a white one at E-6.
    const board = createBoardWithUnits([
      placed(firstBlack, 'D-5', 'north'),
      placed(firstWhite, 'E-6', 'north'),
    ]);

    // Only one of the two is an enemy, so the diagonal is open.
    expect(diagonalIsClear('black', board, 'E-5', 'D-6')).toBe(true);
  });

  it('refuses a target that is not a diagonal neighbour', () => {
    const board = createEmptyStandardBoard();

    // E-6 is beside E-5, not diagonal to it: there is no corner to block.
    expect(() => diagonalIsClear('black', board, 'E-5', 'E-6')).toThrow(
      'Target space E-6 is not diagonally adjacent to E-5',
    );
  });
});
