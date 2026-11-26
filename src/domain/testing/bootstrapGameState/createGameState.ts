import type { PlayerSide } from '@entities';
import type { AuthoritativeGameState } from '@game';
import type { UnitPlacementSpec } from './unitPlacementSpec';
import { createBoardWithUnits } from '@testing/createBoard';
import {
  assignInstanceNumbers,
  normalizeUnitPlacement,
} from './unitPlacementSpec';
import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms';
import { replaceBoard } from '@testing/replaceBoard';

/**
 * Creates a game state with units placed according to the provided specifications.
 */
export function createGameState(
  units: UnitPlacementSpec[],
  options?: { currentInitiative?: PlayerSide },
): AuthoritativeGameState {
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
  return replaceBoard(gameState, board);
}
