import type { GameState, RoutState } from '@game';
import { throwIfBypassed } from '@utils';
import { getRangedAttackApplyState } from '../attackApply/getRangedAttackApplyState';
import { getRoutStateFromAttackApply } from './getRoutStateFromAttackApply';

/**
 * The rout on the ranged attack apply.
 *
 * Descends RangedAttackResolutionState -> AttackApplyState -> RoutState.
 *
 * @param state - The game state
 * @returns The rout substep
 * @throws Error when there is no ranged attack apply, or when
 * the attack applied no rout to it
 */
export function getRangedAttackRoutState(state: GameState): RoutState {
  const attackApplyState = getRangedAttackApplyState(state);
  // An attack that applied no rout answers `'bypassed'`. That is a fact about
  // the attack, not a rout this getter can hand back.
  const routState = throwIfBypassed(
    getRoutStateFromAttackApply(attackApplyState),
    'The ranged attack applied no rout',
  );
  return routState;
}
