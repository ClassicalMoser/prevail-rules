import type { AttackApplyState, GameState } from '@game';
import { throwIfPending } from '@utils';
import { hasInitiative } from '@queries/player';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Gets the attack apply state from melee resolution for a specific player.
 * Assumes we're in resolveMelee phase with a melee resolution state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The attack apply state for the player
 * @throws Error if not in resolveMelee phase or attack apply state is missing
 */
export function getMeleeAttackApplyState(
  state: GameState,
  player: 'white' | 'black',
): AttackApplyState {
  const meleeState = getMeleeResolutionState(state);
  // The slots are named for the order they resolve in, so the owner has to be
  // placed in that order first.
  const attackApplyState = hasInitiative(state, player)
    ? meleeState.firstPlayerAttackApplyState
    : meleeState.secondPlayerAttackApplyState;
  const opened = throwIfPending(
    attackApplyState,
    `No ${player} attack apply state found in melee resolution`,
  );
  return opened;
}
