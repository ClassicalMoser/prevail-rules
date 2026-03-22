import type { Board, GameState } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
  getMeleeResolutionState,
} from '@queries';

/**
 * Generates a CompleteAttackApplyEvent to complete an attack apply substep.
 * This marks that all attack results (rout/retreat/reverse) have been resolved.
 *
 * @param state - The current game state
 * @returns A complete CompleteAttackApplyEvent
 */
export function generateCompleteAttackApplyEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteAttackApplyEvent<TBoard, 'completeAttackApply'> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase === 'issueCommands') {
    const attackApply = getAttackApplyStateFromRangedAttack(state);
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
      attackType: 'ranged',
      defendingPlayer: attackApply.defendingUnit.playerSide,
    };
  }

  if (phaseState.phase === 'resolveMelee') {
    const meleeState = getMeleeResolutionState(state);
    const defendingPlayer = getDefendingPlayerForNextIncompleteMeleeAttackApply(
      state,
      meleeState,
    );

    if (defendingPlayer === null) {
      throw new Error(
        'No incomplete attack apply state found in melee resolution',
      );
    }

    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
      attackType: 'melee',
      defendingPlayer,
    };
  }

  throw new Error(
    `completeAttackApply not expected in phase: ${phaseState.phase}`,
  );
}
