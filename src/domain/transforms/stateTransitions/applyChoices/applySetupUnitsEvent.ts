import type { SetupUnitsEvent } from '@events';
import type { GameState } from '@game';
import { deployCommander, deployUnit } from '@transforms/pureTransforms';

/**
 * Applies a SetupUnitsEvent to the game state: the player deploys (§3.5).
 * Each unit leaves the reserve for its placement, and the player's commander
 * is placed on `commanderCoordinate` (§3.5.3). Round 0 ends after both sides
 * have set up, with its own `roundEnd`, as every round does.
 *
 * Event is assumed pre-validated (setup phase, valid placements).
 *
 * @param event - The setup units event to apply
 * @param state - The current game state
 * @returns A new game state with the units and commander placed on the board
 */
export function applySetupUnitsEvent<S extends GameState>(
  event: SetupUnitsEvent,
  state: S,
): S {
  const { commanderCoordinate, player, unitPlacements } = event;

  // Each unit deploys in turn: out of reserve and onto its space at once.
  let deployed = state;
  for (const unitPlacement of unitPlacements) {
    deployed = deployUnit(deployed, unitPlacement);
  }

  // Then the commander takes its place.
  const withCommander = deployCommander(deployed, player, commanderCoordinate);
  return withCommander;
}
