import type { AttackApplyState, ReverseState } from '@game';
import { throwIfPending } from '@utils';

/**
 * The reverse on an attack apply, or `'bypassed'` when this attack has none.
 *
 * `'bypassed'` is an answer: the rules apply no reverse to this attack, whether
 * its threshold went unmet or a rout superseded it. `'pending'` is not an
 * answer — that step is still due and nothing has opened it, so asking for the
 * substep then is a sequencing fault rather than a fact about the game.
 *
 * @param attackApplyState - The attack apply state
 * @returns The reverse substep, or `'bypassed'` when no reverse applies
 * @throws Error when the reverse is due and has not been opened yet
 */
export function getReverseStateFromAttackApply(
  attackApplyState: AttackApplyState,
): ReverseState | 'bypassed' {
  const reverseState = throwIfPending(
    attackApplyState.reverseState,
    'The reverse on this attack apply has not been opened yet',
  );
  return reverseState;
}
