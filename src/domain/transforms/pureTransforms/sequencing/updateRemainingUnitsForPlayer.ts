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
  const phaseState = getIssueCommandsPhaseState(state);
  const written = hasInitiative(state, player)
    ? { ...phaseState, remainingUnitsFirstPlayer: [...units] }
    : { ...phaseState, remainingUnitsSecondPlayer: [...units] };
  const updated = updatePhaseState(state, written);
  return updated;
}
