import type { Line, StandardBoard, StandardBoardCoordinate } from '@entities';
import {
  createEmptyStandardBoard,
  getLinesFromUnit,
  getPlayerUnitWithPosition,
} from '@queries';
import { createBoardWithUnits, createTestUnit } from '@testing';
import { isValidLine } from '@validation';
import { describe, expect, it } from 'vitest';

describe('isValidLine', () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();

  describe('valid lines', () => {
    it('should return true for a single unit', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = Array.from(lines)[0]!;

      expect(isValidLine(board, line)).toBe(true);
    });

    it('should return true for two units facing the same direction', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: unit2, coordinate: 'E-6', facing: 'north' },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = Array.from(lines)[0]!;

      expect(isValidLine(board, line)).toBe(true);
    });

    it('should return true for two units facing opposite directions', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: unit2, coordinate: 'E-6', facing: 'south' },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = Array.from(lines)[0]!;

      expect(isValidLine(board, line)).toBe(true);
    });

    it('should return true for a line with 8 units', () => {
      const units = Array.from({ length: 8 }, (_, i) =>
        createTestUnit('black', { attack: 3, instanceNumber: i + 1 }),
      );
      const board = createBoardWithUnits([
        { unit: units[0]!, coordinate: 'E-1', facing: 'north' },
        { unit: units[1]!, coordinate: 'E-2', facing: 'north' },
        { unit: units[2]!, coordinate: 'E-3', facing: 'north' },
        { unit: units[3]!, coordinate: 'E-4', facing: 'north' },
        { unit: units[4]!, coordinate: 'E-5', facing: 'north' },
        { unit: units[5]!, coordinate: 'E-6', facing: 'north' },
        { unit: units[6]!, coordinate: 'E-7', facing: 'north' },
        { unit: units[7]!, coordinate: 'E-8', facing: 'north' },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = Array.from(lines)[0]!;

      expect(isValidLine(board, line)).toBe(true);
    });

    it('should return true for a diagonal line (northEast facing)', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      // Unit facing northEast forms line going northWest-southEast (perpendicular)
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'northEast' },
        { unit: unit2, coordinate: 'D-6', facing: 'northEast' }, // northWest of E-5
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = Array.from(lines)[0]!;

      expect(isValidLine(board, line)).toBe(true);
    });

    it('should return true for a diagonal line with opposite facing (southWest)', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      // Unit facing northEast forms line going northWest-southEast (perpendicular)
      // Unit2 facing southWest (opposite) should also be valid
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'northEast' },
        { unit: unit2, coordinate: 'D-6', facing: 'southWest' }, // northWest of E-5, opposite facing
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const lines = getLinesFromUnit(board, unitWithPlacement);
      const line = Array.from(lines)[0]!;

      expect(isValidLine(board, line)).toBe(true);
    });
  });

  describe('invalid lines', () => {
    it('should return false for an empty line', () => {
      const invalidLine = { unitPlacements: [] };
      expect(isValidLine(standardBoard, invalidLine)).toBe(false);
    });

    it('should return false for a line with more than MAX_LINE_LENGTH units', () => {
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
          unit,
          placement: {
            coordinate: coordinates[i]!,
            facing: 'north',
          },
        })),
      };
      expect(isValidLine(standardBoard, invalidLine)).toBe(false);
    });

    it('should return false for units on different sides', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const invalidLine = {
        unitPlacements: [
          {
            unit: unit1,
            placement: { coordinate: 'E-5' as const, facing: 'north' as const },
          },
          {
            unit: unit2,
            placement: { coordinate: 'E-6' as const, facing: 'north' as const },
          },
        ],
      };
      expect(isValidLine(standardBoard, invalidLine)).toBe(false);
    });

    it('should return false for units with wrong facing (not same or opposite)', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: unit2, coordinate: 'E-6', facing: 'east' }, // Wrong facing
      ]);

      const invalidLine = {
        unitPlacements: [
          {
            unit: unit1,
            placement: { coordinate: 'E-5' as const, facing: 'north' as const },
          },
          {
            unit: unit2,
            placement: { coordinate: 'E-6' as const, facing: 'east' as const },
          },
        ],
      };
      expect(isValidLine(board, invalidLine)).toBe(false);
    });

    it('should return false for non-contiguous units (gap in line)', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const invalidLine = {
        unitPlacements: [
          {
            unit: unit1,
            placement: { coordinate: 'E-5' as const, facing: 'north' as const },
          },
          {
            unit: unit2,
            placement: { coordinate: 'E-7' as const, facing: 'north' as const }, // Gap at E-6
          },
        ],
      };
      expect(isValidLine(standardBoard, invalidLine)).toBe(false);
    });

    it('should return false for units not in flanking spaces', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const invalidLine = {
        unitPlacements: [
          {
            unit: unit1,
            placement: { coordinate: 'E-5' as const, facing: 'north' as const },
          },
          {
            unit: unit2,
            placement: { coordinate: 'F-5' as const, facing: 'north' as const }, // Not in flanking spaces (should be E-6 or E-4)
          },
        ],
      };
      expect(isValidLine(standardBoard, invalidLine)).toBe(false);
    });

    it('should return false for diagonal line with wrong direction', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      // Unit facing northEast forms line going northWest-southEast (perpendicular)
      // Flanking spaces for E-5 facing northEast are D-4 and F-6
      // D-5 is not in the flanking spaces
      const invalidLine = {
        unitPlacements: [
          {
            unit: unit1,
            placement: {
              coordinate: 'E-5' as const,
              facing: 'northEast' as const,
            },
          },
          {
            unit: unit2,
            placement: {
              coordinate: 'D-5' as const,
              facing: 'northEast' as const,
            }, // Not in flanking spaces (should be D-4 or F-6)
          },
        ],
      };
      expect(isValidLine(standardBoard, invalidLine)).toBe(false);
    });
  });
  describe('edge cases', () => {
    it('should return false instead of throwing for a bad input type', () => {
      const board = undefined as unknown as StandardBoard;
      const line = undefined as unknown as Line;
      expect(isValidLine(board, line)).toBe(false);
    });
  });
});
