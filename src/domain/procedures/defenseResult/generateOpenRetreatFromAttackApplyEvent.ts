import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
  getOtherPlayer,
} from '@queries';

/**
 * Builds the open-retreat-from-attack-apply effect with explicit resolution
 * context so apply does not branch on phase or probe players.
 *
 * The attack already measured a retreat; this finds the apply whose retreat
 * slot is still pending and names where that apply lives.
 */
export function generateOpenRetreatFromAttackApplyEvent(
  state: GameState,
  eventNumber: number,
): OpenRetreatFromAttackApplyEvent {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const apply = getAttackApplyStateFromRangedAttack(state);
    // A retreat opens only while its slot is still waiting to be written.
    if (apply.retreatState !== 'pending') {
      throw new Error('Retreat is not pending on the ranged attack apply');
    }
    return {
      attackResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
      effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
    };
  }

  if (phaseState.phase === 'resolveMelee') {
    // Initiative order: the first defender still waiting on a retreat opens next.
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);
    const firstApply = getAttackApplyStateFromMelee(state, firstPlayer);
    if (firstApply.retreatState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: firstPlayer,
        effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
      };
    }
    const secondApply = getAttackApplyStateFromMelee(state, secondPlayer);
    if (secondApply.retreatState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: secondPlayer,
        effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
      };
    }
    throw new Error('No pending retreat on either melee attack apply');
  }

  throw new Error(
    `Attack-apply retreat open not expected in phase: ${phaseState.phase}`,
  );
}
