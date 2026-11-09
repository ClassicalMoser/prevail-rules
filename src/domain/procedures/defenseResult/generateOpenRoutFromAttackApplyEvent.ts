import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import {
  getMeleeAttackApplyState,
  getRangedAttackApplyState,
  getCurrentPhaseState,
  getOtherPlayer,
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
    // The first player's blow lands first, so the second player's unit is
    // the first one still waiting on a rout to open (§7.5.6).
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);
    const secondApply = getMeleeAttackApplyState(state, secondPlayer);
    if (secondApply.routState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: secondPlayer,
        effectType: OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
      };
    }
    const firstApply = getMeleeAttackApplyState(state, firstPlayer);
    if (firstApply.routState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: firstPlayer,
        effectType: OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
      };
    }
    throw new Error('No pending rout on either melee attack apply');
  }

  throw new Error(
    `Attack-apply rout open not expected in phase: ${phaseState.phase}`,
  );
}
