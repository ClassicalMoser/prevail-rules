import type { PlayerSide } from '@entities';
import type { GameState, RallyResolutionState } from '@game';
import { hasInitiative } from '@queries/player';
import { isPending } from '@utils';
import { getCleanupPhaseState } from '../phases/getCleanupPhaseState';

/**
 * One player's rally this cleanup, or `undefined` before they have chosen
 * whether to rally. The slots are named for the order the rallies come in:
 * the player with initiative rallies first (§10.3).
 *
 * Callers that know the rally has begun use `getRallyResolutionState`.
 *
 * @param state - The game state, in cleanup
 * @param player - The player whose rally to read
 * @returns That player's rally, or `undefined` when it has not begun
 * @throws Error when the game is not in cleanup
 */
export function findRallyResolutionState(
  state: GameState,
  player: PlayerSide,
): RallyResolutionState | undefined {
  const phaseState = getCleanupPhaseState(state);
  const slot = hasInitiative(state, player)
    ? phaseState.firstPlayerRallyResolutionState
    : phaseState.secondPlayerRallyResolutionState;
  if (isPending(slot)) {
    return undefined;
  }
  return slot;
}
