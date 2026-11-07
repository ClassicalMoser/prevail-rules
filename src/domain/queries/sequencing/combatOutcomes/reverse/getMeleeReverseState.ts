import type { GameState, ReverseState } from '@game';
import { throwIfBypassed } from '@utils';
import { getMeleeAttackApplyState } from '../attackApply/getMeleeAttackApplyState';
import { getReverseStateFromAttackApply } from './getReverseStateFromAttackApply';

/**
 * The reverse on the melee attack apply.
 *
 * Descends MeleeResolutionState -> AttackApplyState -> ReverseState.
 *
 * @param state - The game state
 * @param player - The player whose side of the melee to read
 * @returns The reverse substep
 * @throws Error when there is no melee attack apply for that player, or when
 * the attack applied no reverse to it
 */
export function getMeleeReverseState(
  state: GameState,
  player: 'white' | 'black',
): ReverseState {
  const attackApplyState = getMeleeAttackApplyState(state, player);
  // An attack that applied no reverse answers `'bypassed'`. That is a fact about
  // the attack, not a reverse this getter can hand back.
  const reverseState = throwIfBypassed(
    getReverseStateFromAttackApply(attackApplyState),
    `The melee attack on ${player} applied no reverse`,
  );
  return reverseState;
}
