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
  // Each unit is numbered as its side numbers copies of its type (§3.1),
  // unless the spec gave it a number by hand.
  const assignments = assignInstanceNumbers(units);

  // Every shorthand spec becomes a whole unit standing on a space with a
  // facing, the form the board's own writer takes.
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );

  // The units go on an empty standard board one at a time, as play's own
  // transform would set each down.
  const board = createBoardWithUnits(normalizedUnits);

  // The board, holding exactly the units the spec named.
  return board;
}
