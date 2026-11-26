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
  // A new standard game. White holds the initiative as a game starts
  // (§3.3.2); a spec about the first player's turn may hand it to Black.
  const gameState =
    options?.currentInitiative === undefined
      ? createEmptyGameState('standard')
      : updateCurrentInitiative(
          createEmptyGameState('standard'),
          options.currentInitiative,
        );

  // Every unit stands where the spec put it, numbered as an army numbers its
  // copies, so no two units share an identity.
  const board = createBoard(units);

  // The board goes into the game with the index worked out from it, so a
  // query asking where a unit stands finds it there.
  const placed = replaceBoard(gameState, board);

  // The game, ready for whatever phase the spec layers on top.
  return placed;
}
