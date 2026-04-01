import type { Board } from '@entities';
import type { AttackApplyState, GameStateWithBoard, RoutState } from '@game';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getMeleeResolutionState } from '../getCommandResolutionState';

/**
 * Gets the rout state from an attack apply state.
 * Assumes the attack apply state has a rout state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState,
): RoutState {
  if (!attackApplyState.routState) {
    throw new Error('No rout state found in attack apply state');
  }
  return attackApplyState.routState;
}

/**
 * Rout state from melee resolution, in initiative order (first player's apply first).
 * Assumes resolveMelee phase and that one attack-apply carries an active rout.
 */
export function getRoutStateFromMeleeResolutionByInitiative<
  TBoard extends Board,
>(state: GameStateWithBoard<TBoard>): RoutState {
  const meleeState = getMeleeResolutionState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  const firstApply = meleeState[`${firstPlayer}AttackApplyState`];
  const secondApply = meleeState[`${secondPlayer}AttackApplyState`];

  if (firstApply?.routState) {
    return firstApply.routState;
  }
  if (secondApply?.routState) {
    return secondApply.routState;
  }
  throw new Error('No rout state found in melee resolution');
}
