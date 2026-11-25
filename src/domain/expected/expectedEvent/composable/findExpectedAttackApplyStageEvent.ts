import type { ExpectedEventInfo } from '@events';
import type { AttackApplyState } from '@game';
import type { AttackApplyStage } from '@queries';
import { isOpenSubstep } from '@queries';
import { isPending } from '@utils';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

// TODO(misleading): "a rout takes the lower two stages with it (§7.5.3), so at
// most one stage is ever left to a unit that routs" is not what the code or the
// rule does. §7.5.3 says a unit that will rout still falls back and turns about
// first, and `createAttackApplyState` leaves all three stages due when all three
// thresholds are met. Only a retreat that cannot be made routs in its place and
// bypasses the later two (`applyTriggerRoutFromRetreatEvent`, §7.5.6). Settle by
// rewording the header to say that.
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
      // Opening the retreat works out where the unit may fall back to from
      // where it stands now (§9.1.3).
      if (isPending(retreatState)) {
        const openRetreat: ExpectedEventInfo = {
          actionType: 'gameEffect',
          effectType: 'openRetreatFromAttackApply',
        };
        return openRetreat;
      }

      // An open retreat drives itself, through a choice of path or the rout
      // that takes its place. A bypassed or finished one has nothing due.
      if (isOpenSubstep(retreatState) && !retreatState.completed) {
        const retreatDue = getExpectedRetreatEvent(retreatState);
        return retreatDue;
      }

      // Nothing due in this stage for this unit.
      return undefined;
    }
    case 'reverse': {
      const reverseState = attackApplyState.reverseState;
      // The reverse opens on its turn, after any retreat has moved the unit,
      // so it turns where it then stands (§7.5.4).
      if (isPending(reverseState)) {
        const openReverse: ExpectedEventInfo = {
          actionType: 'gameEffect',
          effectType: 'openReverseFromAttackApply',
        };
        return openReverse;
      }
      // A unit still locked with an opponent resolves its reverse without
      // turning (§7.5.5), so the event is asked for either way.
      if (isOpenSubstep(reverseState) && !reverseState.completed) {
        const reverseDue = getExpectedReverseEvent(reverseState);
        return reverseDue;
      }

      // Nothing due in this stage for this unit.
      return undefined;
    }
    case 'rout': {
      const routState = attackApplyState.routState;
      // The rout comes last (§7.5.3); opening it takes the unit off the
      // board, and its owner then owes its Morale (§9.3).
      if (isPending(routState)) {
        const openRout: ExpectedEventInfo = {
          actionType: 'gameEffect',
          effectType: 'openRoutFromAttackApply',
        };
        return openRout;
      }

      // An open rout waits on its Morale being counted and paid.
      if (isOpenSubstep(routState) && !routState.completed) {
        const routDue = getExpectedRoutEvent(routState);
        return routDue;
      }

      // Nothing due in this stage for this unit.
      return undefined;
    }
    default: {
      // The stage is the caller's argument, so a value outside the three is
      // refused by name.
      const _exhaustive: never = stage;
      throw new Error(`Unknown attack apply stage: ${_exhaustive}`);
    }
  }
}
