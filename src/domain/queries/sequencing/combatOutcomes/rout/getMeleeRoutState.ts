import type { GameState, RoutState } from '@game';
import { throwIfBypassed } from '@utils';
import { getMeleeAttackApplyState } from '../attackApply/getMeleeAttackApplyState';
import { getRoutStateFromAttackApply } from './getRoutStateFromAttackApply';

/**
 * The rout on the melee attack apply.
 *
 * Descends MeleeResolutionState -> AttackApplyState -> RoutState.
 *
 * @param state - The game state
 * @param player - The player whose side of the melee to read
 * @returns The rout substep
 * @throws Error when there is no melee attack apply for that player, or when
 * the attack applied no rout to it
 */
export function getMeleeRoutState(
  state: GameState,
  player: 'white' | 'black',
): RoutState {
  const attackApplyState = getMeleeAttackApplyState(state, player);
  // An attack that applied no rout answers `'bypassed'`. That is a fact about
  // the attack, not a rout this getter can hand back.
  const routState = throwIfBypassed(
    getRoutStateFromAttackApply(attackApplyState),
    `The melee attack on ${player} applied no rout`,
  );
  return routState;
}
