import type { Board } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import type { GameStateWithBoard } from '@game';
import {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
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
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): CompleteAttackApplyEvent<TBoard, 'completeAttackApply'> {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const attackApply = getAttackApplyStateFromRangedAttack(state);
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
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
      eventNumber,
      attackType: 'melee',
      defendingPlayer,
    };
  }

  throw new Error(
    `completeAttackApply not expected in phase: ${phaseState.phase}`,
  );
}
