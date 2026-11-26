import type { Board } from '@entities';
import type { UnitPlacementSpec } from './unitPlacementSpec';
import { createBoardWithUnits } from '@testing/createBoard';
import {
  assignInstanceNumbers,
  normalizeUnitPlacement,
} from './unitPlacementSpec';

/**
 * Creates a board with units placed according to the provided specifications.
 */
export function createBoard(units: UnitPlacementSpec[]): Board {
  const assignments = assignInstanceNumbers(units);
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );
  const board = createBoardWithUnits(normalizedUnits);
  return board;
}
