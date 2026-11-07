import type { AttackApplyState, RetreatState } from '@game';
import { throwIfPending } from '@utils';

/**
 * The retreat on an attack apply, or `'bypassed'` when this attack has none.
 *
 * `'bypassed'` is an answer: the rules apply no retreat to this attack, whether
 * its threshold went unmet or a rout superseded it. `'pending'` is not an
 * answer — that step is still due and nothing has opened it, so asking for the
 * substep then is a sequencing fault rather than a fact about the game.
 *
 * @param attackApplyState - The attack apply state
 * @returns The retreat substep, or `'bypassed'` when no retreat applies
 * @throws Error when the retreat is due and has not been opened yet
 */
export function getRetreatStateFromAttackApply(
  attackApplyState: AttackApplyState,
): RetreatState | 'bypassed' {
  const retreatState = throwIfPending(
    attackApplyState.retreatState,
    'The retreat on this attack apply has not been opened yet',
  );
  return retreatState;
}
