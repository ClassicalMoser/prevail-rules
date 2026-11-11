import type { PlayerSide } from '@entities';
import type { GameState, RallyResolutionState } from '@game';
import { getCleanupPhaseState, hasInitiative } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Writes one player's rally for this cleanup. The slots are named for the
 * order the rallies come in: the player with initiative rallies first
 * (§10.3), as `findRallyResolutionState` reads them.
 *
 * @param state - The game state, in cleanup
 * @param player - The player whose rally this is
 * @param rallyState - Their rally
 * @returns The game state with that rally written
 * @throws Error when the game is not in cleanup
 */
export function updateRallyResolutionState<S extends GameState>(
  state: S,
  player: PlayerSide,
  rallyState: RallyResolutionState,
): S {
  const phaseState = getCleanupPhaseState(state);
  const written = hasInitiative(state, player)
    ? { ...phaseState, firstPlayerRallyResolutionState: rallyState }
    : { ...phaseState, secondPlayerRallyResolutionState: rallyState };
  const updated = updatePhaseState(state, written);
  return updated;
}
