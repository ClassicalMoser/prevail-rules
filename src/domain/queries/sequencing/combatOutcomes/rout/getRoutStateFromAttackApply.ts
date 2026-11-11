import type { AttackApplyState, RoutState } from '@game';
import { throwIfPending } from '@utils';

/**
 * The rout on an attack apply, or `'bypassed'` when this attack has none.
 *
 * `'bypassed'` is an answer: the rules apply no rout to this attack, whether
 * its threshold went unmet or the unit had already left the board. `'pending'` is not an
 * answer — that step is still due and nothing has opened it, so asking for the
 * substep then is a sequencing fault rather than a fact about the game.
 *
 * @param attackApplyState - The attack apply state
 * @returns The rout substep, or `'bypassed'` when no rout applies
 * @throws Error when the rout is due and has not been opened yet
 */
export function getRoutStateFromAttackApply(
  attackApplyState: AttackApplyState,
): RoutState | 'bypassed' {
  const routState = throwIfPending(
    attackApplyState.routState,
    'The rout on this attack apply has not been opened yet',
  );
  return routState;
}
