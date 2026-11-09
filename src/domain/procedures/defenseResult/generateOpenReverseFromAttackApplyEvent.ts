import type { OpenReverseFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import {
  getMeleeAttackApplyState,
  getRangedAttackApplyState,
  getCurrentPhaseState,
  getOtherPlayer,
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
    // The first player's blow lands first, so the second player's unit is
    // the first one still waiting on a reverse to open (§7.5.6).
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);
    const secondApply = getMeleeAttackApplyState(state, secondPlayer);
    if (secondApply.reverseState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: secondPlayer,
        effectType: OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
      };
    }
    const firstApply = getMeleeAttackApplyState(state, firstPlayer);
    if (firstApply.reverseState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: firstPlayer,
        effectType: OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
      };
    }
    throw new Error('No pending reverse on either melee attack apply');
  }

  throw new Error(
    `Attack-apply reverse open not expected in phase: ${phaseState.phase}`,
  );
}
