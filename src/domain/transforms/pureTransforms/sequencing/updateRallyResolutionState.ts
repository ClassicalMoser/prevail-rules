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
  // Rallies happen only in cleanup (§4.5.2); asked elsewhere, this throws.
  const phaseState = getCleanupPhaseState(state);

  // The first player decides and finishes their rally before the second
  // (§10.3.6), so the player holding the initiative fills the first slot and
  // the other player the second.
  const written = hasInitiative(state, player)
    ? { ...phaseState, firstPlayerRallyResolutionState: rallyState }
    : { ...phaseState, secondPlayerRallyResolutionState: rallyState };
  const updated = updatePhaseState(state, written);

  // Cleanup with that player's rally as it now stands.
  return updated;
}
