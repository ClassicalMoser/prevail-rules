import type { PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getIssueCommandsPhaseState, hasInitiative } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Writes the ordered units one player still has to carry out, to the slot
 * their initiative gives them, as `getRemainingUnitsForPlayer` reads it.
 *
 * @param state - The game state, in issue commands
 * @param player - The player whose units these are
 * @param units - The units still to act
 * @returns The game state with those units written
 */
export function updateRemainingUnitsForPlayer<S extends GameState>(
  state: S,
  player: PlayerSide,
  units: readonly UnitInstance[],
): S {
  // Orders are only carried out in Phase 3; asked elsewhere, this throws.
  const phaseState = getIssueCommandsPhaseState(state);

  // The first player carries out their orders before the second issues any
  // (§4.3), so the player holding the initiative keeps the first list and
  // the other player the second. Each unit acts once (§4.3.6), so the list
  // shrinks as units finish, and empties when the player is done.
  const written = hasInitiative(state, player)
    ? { ...phaseState, remainingUnitsFirstPlayer: [...units] }
    : { ...phaseState, remainingUnitsSecondPlayer: [...units] };
  const updated = updatePhaseState(state, written);

  // Phase 3 with that player's units still to act.
  return updated;
}
