import type { OpenReverseFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import {
  getMeleeAppliesInResolutionOrder,
  getMeleeResolutionState,
  getRangedAttackApplyState,
  getCurrentPhaseState,
} from '@queries';

/**
 * Builds the open-reverse-from-attack-apply effect with explicit resolution
 * context so apply does not branch on phase or probe players.
 *
 * The attack already measured a reverse; this finds the apply whose reverse
 * slot is still pending and names where that apply lives.
 */
export function generateOpenReverseFromAttackApplyEvent(
  state: GameState,
  eventNumber: number,
): OpenReverseFromAttackApplyEvent {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const apply = getRangedAttackApplyState(state);
    // A reverse opens only while its slot is still waiting to be written.
    if (apply.reverseState !== 'pending') {
      throw new Error('Reverse is not pending on the ranged attack apply');
    }
    return {
      attackResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
      effectType: OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
  }

  if (phaseState.phase === 'resolveMelee') {
    // The first reverse still waiting to open, in the order results take
    // effect: the first player's blow lands first, so the second player's
    // unit comes first (§7.5.6).
    const meleeState = getMeleeResolutionState(state);
    const appliesInOrder = getMeleeAppliesInResolutionOrder(meleeState);
    const apply = appliesInOrder.find(
      (candidate) => candidate.reverseState === 'pending',
    );
    if (apply === undefined) {
      throw new Error('No pending reverse on either melee attack apply');
    }
    const event: OpenReverseFromAttackApplyEvent = {
      attackResolutionContext: 'melee',
      defendingPlayer: apply.defendingUnit.playerSide,
      effectType: OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
    return event;
  }

  throw new Error(
    `Attack-apply reverse open not expected in phase: ${phaseState.phase}`,
  );
}
