import type { PlayerSide, Board } from '@entities';
import type { GameStateForVisibility } from '@game';
import type { UnitPlacementSpec } from './unitPlacementSpec';
import { createBoardWithUnits } from '@testing/createBoard';

import {
  assignInstanceNumbers,
  normalizeUnitPlacement,
} from './unitPlacementSpec';

import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms';
/**
 * Creates a game state with units placed according to the provided specifications.
 */
export function createGameState(
  units: UnitPlacementSpec[],
  options?: { currentInitiative?: PlayerSide },
): GameStateForVisibility {
  const gameState =
    options?.currentInitiative === undefined
      ? createEmptyGameState('standard')
      : updateCurrentInitiative(
          createEmptyGameState('standard'),
          options.currentInitiative,
        );
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
export function createBoard(units: UnitPlacementSpec[]): Board {
  const assignments = assignInstanceNumbers(units);
  const normalizedUnits = assignments.map(({ spec, instanceNumber }) =>
    normalizeUnitPlacement(spec, instanceNumber),
  );
  return createBoardWithUnits(normalizedUnits);
}
