import type { MoveDelta } from '@entities';
import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import { getLegalRetreats } from '@legality';
import {
  getMeleeAttackApplyState,
  getRangedAttackApplyState,
  getCurrentPhaseState,
  getOtherPlayer,
  getPositionOfUnit,
} from '@queries';

/**
 * The retreats the apply's defender may make from where it stands now
 * (§9.1). Read from the board when the retreat opens, since an earlier
 * result in the same melee may have moved things (§7.5.6).
 *
 * @param state - The game state as the retreat opens
 * @param apply - The attack apply whose defender must retreat
 * @returns Each legal retreat as its path; empty when the unit must rout
 */
function retreatPathsFor(
  state: GameState,
  apply: AttackApplyState,
): MoveDelta[][] {
  const placement = getPositionOfUnit(state.boardState, apply.defendingUnit);
  const paths = getLegalRetreats(
    { placement, unit: apply.defendingUnit },
    state,
  );
  return paths;
}

/**
 * Builds the open-retreat-from-attack-apply effect with explicit resolution
 * context so apply does not branch on phase or probe players.
 *
 * The attack already measured a retreat; this finds the apply whose retreat
 * slot is still pending, names where that apply lives, and records the
 * retreats its defender may make, so the log shows what was legal.
 */
export function generateOpenRetreatFromAttackApplyEvent(
  state: GameState,
  eventNumber: number,
): OpenRetreatFromAttackApplyEvent {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const apply = getRangedAttackApplyState(state);
    // A retreat opens only while its slot is still waiting to be written.
    if (apply.retreatState !== 'pending') {
      throw new Error('Retreat is not pending on the ranged attack apply');
    }
    return {
      attackResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
      effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
      retreatPaths: retreatPathsFor(state, apply),
    };
  }

  if (phaseState.phase === 'resolveMelee') {
    // The first player's blow lands first, so the second player's unit is
    // the first one still waiting on a retreat to open (§7.5.6).
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);
    const secondApply = getMeleeAttackApplyState(state, secondPlayer);
    if (secondApply.retreatState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: secondPlayer,
        effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
        retreatPaths: retreatPathsFor(state, secondApply),
      };
    }
    const firstApply = getMeleeAttackApplyState(state, firstPlayer);
    if (firstApply.retreatState === 'pending') {
      return {
        attackResolutionContext: 'melee',
        defendingPlayer: firstPlayer,
        effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
        retreatPaths: retreatPathsFor(state, firstApply),
      };
    }
    throw new Error('No pending retreat on either melee attack apply');
  }

  throw new Error(
    `Attack-apply retreat open not expected in phase: ${phaseState.phase}`,
  );
}
