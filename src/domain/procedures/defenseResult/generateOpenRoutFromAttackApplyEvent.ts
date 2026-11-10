import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import {
  getMeleeAppliesInResolutionOrder,
  getMeleeResolutionState,
  getRangedAttackApplyState,
  getCurrentPhaseState,
} from '@queries';

/**
 * Builds the open-rout-from-attack-apply effect with explicit resolution context
 * so apply does not branch on phase or probe players.
 *
 * The attack already measured a rout; this finds the apply whose rout slot is
 * still pending and names where that apply lives.
 */
export function generateOpenRoutFromAttackApplyEvent(
  state: GameState,
  eventNumber: number,
): OpenRoutFromAttackApplyEvent {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const apply = getRangedAttackApplyState(state);
    // A rout opens only while its slot is still waiting to be written.
    if (apply.routState !== 'pending') {
      throw new Error('Rout is not pending on the ranged attack apply');
    }
    return {
      attackResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
      effectType: OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
  }

  if (phaseState.phase === 'resolveMelee') {
    // The first rout still waiting to open, in the order results take
    // effect: the first player's blow lands first, so the second player's
    // unit comes first (§7.5.6).
    const meleeState = getMeleeResolutionState(state);
    const appliesInOrder = getMeleeAppliesInResolutionOrder(meleeState);
    const apply = appliesInOrder.find(
      (candidate) => candidate.routState === 'pending',
    );
    if (apply === undefined) {
      throw new Error('No pending rout on either melee attack apply');
    }
    const event: OpenRoutFromAttackApplyEvent = {
      attackResolutionContext: 'melee',
      defendingPlayer: apply.defendingUnit.playerSide,
      effectType: OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
    return event;
  }

  throw new Error(
    `Attack-apply rout open not expected in phase: ${phaseState.phase}`,
  );
}
