import {
  createBoardWithEngagedUnits,
  createBoardWithSingleUnit,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';
import { getBoardSpace } from '@queries/board';

import { hasEnemyUnit } from './hasEnemyUnit';

/**
 * Whether a space holds an enemy of the side asking: a lone unit of the other
 * side, or an engagement, which always holds one unit of each.
 */
describe('hasEnemyUnit function', () => {
  it('an empty space holds no enemy for either side', () => {
    // Nothing stands at E-5.
    const space = getBoardSpace(createEmptyStandardBoard(), 'E-5');

    expect(hasEnemyUnit('black', space)).toBe(false);
    expect(hasEnemyUnit('white', space)).toBe(false);
  });

  it('a lone unit is an enemy to the other side only', () => {
    // A black unit alone at E-5.
    const space = getBoardSpace(
      createBoardWithSingleUnit('E-5', 'black'),
      'E-5',
    );

    // Black's own unit is no enemy to Black; it is White's enemy.
    expect(hasEnemyUnit('black', space)).toBe(false);
    expect(hasEnemyUnit('white', space)).toBe(true);
  });

  it('an engaged space holds an enemy for both sides', () => {
    // Black and White engaged at E-5.
    const board = createBoardWithEngagedUnits(
      createTestUnit('black', { attack: 3 }),
      createTestUnit('white', { attack: 3 }),
      'E-5',
    );
    const space = getBoardSpace(board, 'E-5');

    // Whichever side asks, the other side's unit is there.
    expect(hasEnemyUnit('black', space)).toBe(true);
    expect(hasEnemyUnit('white', space)).toBe(true);
  });
});
