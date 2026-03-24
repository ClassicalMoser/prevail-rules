import { getPlayerUnitWithPosition } from '@queries';
import { tempUnits } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { createBoardWithSingleUnit } from './boardWithSingleUnit';

/**
 * createBoardWithSingleUnit: test helper; implementation in boardWithSingleUnit.ts.
 */
describe('createBoardWithSingleUnit', () => {
  it('should place single unit at coordinate with defaults', () => {
    const board = createBoardWithSingleUnit('E-5', 'black');
    const atE5 = getPlayerUnitWithPosition(board, 'E-5', 'black');
    expect(atE5).toBeDefined();
    expect(atE5?.placement.facing).toBe('north');
  });

  it('should accept facing and attack options', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      facing: 'south',
      attack: 2,
    });
    const atE5 = getPlayerUnitWithPosition(board, 'E-5', 'white');
    expect(atE5?.placement.facing).toBe('south');
    expect(atE5?.unit.unitType.stats.attack).toBe(2);
  });

  it('should accept flexibility option', () => {
    const board = createBoardWithSingleUnit('E-5', 'black', {
      flexibility: 1,
    });
    const atE5 = getPlayerUnitWithPosition(board, 'E-5', 'black');
    expect(atE5?.unit.unitType.stats.flexibility).toBe(1);
  });

  it('should accept unitType option', () => {
    const unitType = tempUnits[0];
    const board = createBoardWithSingleUnit('E-5', 'white', {
      unitType,
    });
    const atE5 = getPlayerUnitWithPosition(board, 'E-5', 'white');
    expect(atE5?.unit.unitType).toBe(unitType);
  });
});
