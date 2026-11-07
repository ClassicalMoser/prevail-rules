import type { ExpectedEventInfo } from '@events';
import type { AttackApplyState } from '@game';
import { isOpenSubstep } from '@queries';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for attack apply substeps.
 * This is a composable function that can be used in any context where
 * attack apply state appears (ranged attack resolution, melee resolution, etc.).
 *
 * An attack that reached no threshold (`hasResults === false`, every outcome
 * `'bypassed'`) is valid: expect `completeAttackApply`. Throw only when results
 * are claimed but no matching substep was opened.
 * TODO(misleading): a claimed result with its slot still `'pending'` is now a
 * fresh apply — emit the opener, not a corruption throw.
 *
 * @param attackApplyState - The attack apply state
 * @returns Information about what event is expected
 */
export function getExpectedAttackApplyEvent(
  attackApplyState: AttackApplyState,
): ExpectedEventInfo {
  const { attackResult } = attackApplyState;

  const hasResults =
    attackResult.unitRouted ||
    attackResult.unitRetreated ||
    attackResult.unitReversed;

  // Miss: nothing to apply — complete the empty apply shell.
  if (!hasResults) {
    if (attackApplyState.completed) {
      throw new Error('Attack apply state is already complete');
    }
    return {
      actionType: 'gameEffect',
      effectType: 'completeAttackApply',
    };
  }

  // Priority: rout > retreat > reverse (rout is most severe). A pending slot
  // means that step is still due and must open before it can resolve.

  const routState = attackApplyState.routState;
  if (attackResult.unitRouted) {
    // The attack routed the defender; open the rout before asking to resolve it.
    if (routState === 'pending') {
      return {
        actionType: 'gameEffect',
        effectType: 'openRoutFromAttackApply',
      };
    }
    if (isOpenSubstep(routState)) {
      if (!routState.completed) {
        return getExpectedRoutEvent(routState);
      }
      // If unit was routed, no further resolution is needed
      if (!attackApplyState.completed) {
        return {
          actionType: 'gameEffect',
          effectType: 'completeAttackApply',
        };
      }
      throw new Error('Attack apply state is already complete');
    }
  }

  const retreatState = attackApplyState.retreatState;
  if (attackResult.unitRetreated) {
    // The attack forced a retreat; open it before asking where the unit goes.
    if (retreatState === 'pending') {
      return {
        actionType: 'gameEffect',
        effectType: 'openRetreatFromAttackApply',
      };
    }
    if (isOpenSubstep(retreatState) && !retreatState.completed) {
      return getExpectedRetreatEvent(retreatState);
    }
  }

  const reverseState = attackApplyState.reverseState;
  if (attackResult.unitReversed) {
    // The attack forced a reverse; open it after any retreat has moved the unit.
    if (reverseState === 'pending') {
      return {
        actionType: 'gameEffect',
        effectType: 'openReverseFromAttackApply',
      };
    }
    // A unit still locked with an opponent resolves its reverse without
    // turning, so the event is asked for either way and records which happened.
    if (isOpenSubstep(reverseState) && !reverseState.completed) {
      return getExpectedReverseEvent(reverseState);
    }
  }

  if (!attackApplyState.completed) {
    return {
      actionType: 'gameEffect',
      effectType: 'completeAttackApply',
    };
  }

  // All attack results resolved, command resolution should be complete
  throw new Error('Attack apply state is already complete');
}
