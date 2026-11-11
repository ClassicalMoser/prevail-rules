import type { PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { hasInitiative } from '@queries/player';
import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

/**
 * The units a player's order has still to act in Phase 3 (§4.3.9): those
 * named by the order being carried out that have not yet moved or shot.
 *
 * The phase keeps them by order of play, the first player's and the second's,
 * so a caller who knows only whose they are asks here instead of choosing the
 * slot by hand.
 *
 * @param state - The game state, in the Issue Commands phase
 * @param player - The player whose units to read
 * @returns The player's units still to act
 * @throws Error if the current phase is not Issue Commands
 */
export function getRemainingUnitsForPlayer(
  state: GameState,
  player: PlayerSide,
): readonly UnitInstance[] {
  const phaseState = getIssueCommandsPhaseState(state);
  const remaining = hasInitiative(state, player)
    ? phaseState.remainingUnitsFirstPlayer
    : phaseState.remainingUnitsSecondPlayer;
  return remaining;
}
