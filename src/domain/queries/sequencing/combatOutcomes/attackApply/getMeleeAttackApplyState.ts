import type { AttackApplyState, GameState } from '@game';
import { throwIfPending } from '@utils';
import { hasInitiative } from '@queries/player';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * The apply of the attack on one player's unit in the melee being resolved:
 * the result that unit takes.
 * TODO(composition): the defender-to-slot ternary below is also written
 * inline in the two melee routers here and in four `@transforms` updaters.
 * Settled by a total `find` variant the routers can share.
 * Assumes we're in resolveMelee phase with a melee resolution state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param defendingPlayer - The player whose unit takes the attack
 * @returns The apply of the attack on that player's unit
 * @throws Error if not in resolveMelee phase or attack apply state is missing
 */
export function getMeleeAttackApplyState(
  state: GameState,
  defendingPlayer: 'white' | 'black',
): AttackApplyState {
  const meleeState = getMeleeResolutionState(state);
  // The slots are named for whose unit holds the result, so the owner picks
  // the slot.
  const attackApplyState = hasInitiative(state, defendingPlayer)
    ? meleeState.attackOnFirstPlayerApplyState
    : meleeState.attackOnSecondPlayerApplyState;
  const opened = throwIfPending(
    attackApplyState,
    `No attack apply on ${defendingPlayer} found in melee resolution`,
  );
  return opened;
}
