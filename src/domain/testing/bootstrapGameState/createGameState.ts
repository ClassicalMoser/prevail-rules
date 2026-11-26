import type { PlayerSide } from '@entities';
import type { AuthoritativeGameState } from '@game';
import type { UnitPlacementSpec } from './unitPlacementSpec';
import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms';
import { replaceBoard } from '@testing/replaceBoard';
import { createBoard } from './createBoard';

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
  const board = createBoard(units);
  const placed = replaceBoard(gameState, board);
  return placed;
}
