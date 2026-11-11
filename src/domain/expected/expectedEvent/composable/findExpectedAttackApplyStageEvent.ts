import type { ExpectedEventInfo } from '@events';
import type { AttackApplyState } from '@game';
import type { AttackApplyStage } from './attackApplyStages';
import { isOpenSubstep } from '@queries';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * What one stage of an attack's results still needs, for one unit.
 *
 * An attack's results come in stages (§7.5.2), and a melee carries each stage
 * out for both units before the next one begins (§7.5.6). So the sequencer
 * asks each unit about the stage in turn, and a unit with nothing due in it
 * answers `undefined` and is passed over.
 *
 * A stage the attack did not reach is `'bypassed'`, and a rout takes the
 * lower two stages with it (§7.5.3), so at most one stage is ever left to a
 * unit that routs.
 *
 * @param attackApplyState - One unit's attack apply
 * @param stage - The stage being carried out
 * @returns The event that stage waits on, or `undefined` if nothing is due
 */
export function findExpectedAttackApplyStageEvent(
  attackApplyState: AttackApplyState,
  stage: AttackApplyStage,
): ExpectedEventInfo | undefined {
  switch (stage) {
    case 'retreat': {
      const retreatState = attackApplyState.retreatState;
      // A due stage opens before the unit can be asked anything in it.
      if (retreatState === 'pending') {
        return {
          actionType: 'gameEffect',
          effectType: 'openRetreatFromAttackApply',
        };
      }
      if (isOpenSubstep(retreatState) && !retreatState.completed) {
        return getExpectedRetreatEvent(retreatState);
      }
      return undefined;
    }
    case 'reverse': {
      const reverseState = attackApplyState.reverseState;
      if (reverseState === 'pending') {
        return {
          actionType: 'gameEffect',
          effectType: 'openReverseFromAttackApply',
        };
      }
      // A unit still locked with an opponent resolves its reverse without
      // turning (§7.5.5), so the event is asked for either way.
      if (isOpenSubstep(reverseState) && !reverseState.completed) {
        return getExpectedReverseEvent(reverseState);
      }
      return undefined;
    }
    case 'rout': {
      const routState = attackApplyState.routState;
      if (routState === 'pending') {
        return {
          actionType: 'gameEffect',
          effectType: 'openRoutFromAttackApply',
        };
      }
      if (isOpenSubstep(routState) && !routState.completed) {
        return getExpectedRoutEvent(routState);
      }
      return undefined;
    }
    default: {
      const _exhaustive: never = stage;
      throw new Error(`Unknown attack apply stage: ${_exhaustive}`);
    }
  }
}
