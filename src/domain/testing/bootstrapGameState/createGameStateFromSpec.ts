import type { PlayerSide, StandardBoard } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import type { UnitPlacementSpec } from './unitPlacementSpec';
import { createBoardWithUnits } from '@testing/createBoard';
import { createEmptyGameState } from '@testing/createEmptyGameState';
import {
  assignInstanceNumbers,
  normalizeUnitPlacement,
} from './unitPlacementSpec';

/**
 * Creates a game state with units placed according to the provided specifications.
 */
export function createGameState(
  units: UnitPlacementSpec[],
  options?: { currentInitiative?: PlayerSide },
): StandardGameState {
  const gameState = createEmptyGameState(options);
  const assignments = assignInstanceNumbers(units);
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );
  const board = createBoardWithUnits(normalizedUnits);
  return { ...gameState, boardState: board };
}

/**
 * Creates a board with units placed according to the provided specifications.
 */
export function createBoard(units: UnitPlacementSpec[]): StandardBoard {
  const assignments = assignInstanceNumbers(units);
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );
  return createBoardWithUnits(normalizedUnits);
}
