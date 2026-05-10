import type {
  Board,
  Line,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import { getLinesFromUnit, getPlayerUnitWithPosition } from '@queries';
import { createBoardWithUnits, createTestUnit } from '@testing';
import { createEmptyStandardBoard } from '@transforms';

import { isValidLine } from './isValidLine';

/**
 * IsValidLine: Determines whether a line is valid according to game rules.
 */
describe(isValidLine, () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();

  describe('valid lines', () => {
    it('given a single unit, returns true', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = [...lines][0]!;

      const { result } = isValidLine(board, line);
      expect(result).toBeTruthy();
    });

    it('given two units facing the same direction, returns true', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: unit1 },
        { coordinate: 'E-6', facing: 'north', unit: unit2 },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = [...lines][0]!;

      const { result } = isValidLine(board, line);
      expect(result).toBeTruthy();
    });

    it('given two units facing opposite directions, returns true', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: unit1 },
        { coordinate: 'E-6', facing: 'south', unit: unit2 },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = [...lines][0]!;

      const { result } = isValidLine(board, line);
      expect(result).toBeTruthy();
    });

    it('given a line with 8 units, returns true', () => {
      const units = Array.from({ length: 8 }, (_, i) =>
        createTestUnit('black', { attack: 3, instanceNumber: i + 1 }),
      );
      const board = createBoardWithUnits([
        { coordinate: 'E-1', facing: 'north', unit: units[0]! },
        { coordinate: 'E-2', facing: 'north', unit: units[1]! },
        { coordinate: 'E-3', facing: 'north', unit: units[2]! },
        { coordinate: 'E-4', facing: 'north', unit: units[3]! },
        { coordinate: 'E-5', facing: 'north', unit: units[4]! },
        { coordinate: 'E-6', facing: 'north', unit: units[5]! },
        { coordinate: 'E-7', facing: 'north', unit: units[6]! },
        { coordinate: 'E-8', facing: 'north', unit: units[7]! },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = [...lines][0]!;

      const { result } = isValidLine(board, line);
      expect(result).toBeTruthy();
    });

    it('given a diagonal line (northEast facing), returns true', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      // Unit facing northEast forms line going northWest-southEast (perpendicular)
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'northEast', unit: unit1 },
        { coordinate: 'D-6', facing: 'northEast', unit: unit2 }, // NorthWest of E-5
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = [...lines][0]!;

      const { result } = isValidLine(board, line);
      expect(result).toBeTruthy();
    });

    it('given a diagonal line with opposite facing (southWest), returns true', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      // Unit facing northEast forms line going northWest-southEast (perpendicular)
      // Unit2 facing southWest (opposite) should also be valid
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'northEast', unit: unit1 },
        { coordinate: 'D-6', facing: 'southWest', unit: unit2 }, // NorthWest of E-5, opposite facing
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = [...lines][0]!;

      const { result } = isValidLine(board, line);
      expect(result).toBeTruthy();
    });
  });

  describe('invalid lines', () => {
    it('given an empty line, returns false', () => {
      const invalidLine = { unitPlacements: [] };
      const { result } = isValidLine(standardBoard, invalidLine);
      expect(result).toBeFalsy();
    });

    it('given a line with more than MAX_LINE_LENGTH units, returns false', () => {
      const units = Array.from({ length: 9 }, (_, i) =>
        createTestUnit('black', { attack: 3, instanceNumber: i + 1 }),
      );
      const coordinates: StandardBoardCoordinate[] = [
        'E-1',
        'E-2',
        'E-3',
        'E-4',
        'E-5',
        'E-6',
        'E-7',
        'E-8',
        'E-9',
      ];
      const invalidLine: Line = {
        unitPlacements: units.map((unit, i) => ({
          boardType: 'standard' as const,
          placement: {
            boardType: 'standard' as const,
            coordinate: coordinates[i]!,
            facing: 'north',
          },
          unit,
        })),
      };
      const { result } = isValidLine(standardBoard, invalidLine);
      expect(result).toBeFalsy();
    });

    it('given units on different sides, returns false', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const invalidLine = {
        unitPlacements: [
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5' as const,
              facing: 'north' as const,
            },
            unit: unit1,
          },
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-6' as const,
              facing: 'north' as const,
            },
            unit: unit2,
          },
        ],
      };
      const { result } = isValidLine(standardBoard, invalidLine);
      expect(result).toBeFalsy();
    });

    it('given units with wrong facing (not same or opposite), returns false', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: unit1 },
        { coordinate: 'E-6', facing: 'east', unit: unit2 }, // Wrong facing
      ]);

      const invalidLine = {
        unitPlacements: [
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5' as const,
              facing: 'north' as const,
            },
            unit: unit1,
          },
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-6' as const,
              facing: 'east' as const,
            },
            unit: unit2,
          },
        ],
      };
      const { result } = isValidLine(board, invalidLine);
      expect(result).toBeFalsy();
    });

    it('given non-contiguous units (gap in line), returns false', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const invalidLine = {
        unitPlacements: [
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5' as const,
              facing: 'north' as const,
            },
            unit: unit1,
          },
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-7' as const,
              facing: 'north' as const,
            },
            unit: unit2, // Gap at E-6
          },
        ],
      };
      const { result } = isValidLine(standardBoard, invalidLine);
      expect(result).toBeFalsy();
    });

    it('given units not in flanking spaces, returns false', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const invalidLine = {
        unitPlacements: [
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5' as const,
              facing: 'north' as const,
            },
            unit: unit1,
          },
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'F-5' as const,
              facing: 'north' as const,
            },
            unit: unit2, // Not in flanking spaces (should be E-6 or E-4)
          },
        ],
      };
      const { result } = isValidLine(standardBoard, invalidLine);
      expect(result).toBeFalsy();
    });

    it('given diagonal line with wrong direction, returns false', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      // Unit facing northEast forms line going northWest-southEast (perpendicular)
      // Flanking spaces for E-5 facing northEast are D-4 and F-6
      // D-5 is not in the flanking spaces
      const invalidLine = {
        unitPlacements: [
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5' as const,
              facing: 'northEast' as const,
            },
            unit: unit1,
          },
          {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'D-5' as const,
              facing: 'northEast' as const,
            },
            unit: unit2, // Not in flanking spaces (should be D-4 or F-6)
          },
        ],
      };
      const { result } = isValidLine(standardBoard, invalidLine);
      expect(result).toBeFalsy();
    });
  });
  describe('edge cases', () => {
    it('given a bad input type, returns false instead of throwing', () => {
      // Intentionally bad type casts to test the function
      const board = undefined as unknown as Board;
      const line = undefined as unknown as Line;
      const { result } = isValidLine(board, line);
      expect(result).toBeFalsy();
    });
  });
});
