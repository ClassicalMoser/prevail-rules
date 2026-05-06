import {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  CompleteAttackApplyEvent,
  GAME_EFFECT_EVENT_TYPE,
} from "@events";
import {
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseStateForBoard,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
  getMeleeResolutionState,
} from "@queries";
import { Board } from "@entities";
import type { GameState, GameStateForBoard, MeleeResolutionState } from "@game";

/**
 * Generates a CompleteAttackApplyEvent to complete an attack apply substep.
 * This marks that all attack results (rout/retreat/reverse) have been resolved.
 *
 * @param state - The current game state
 * @returns A complete CompleteAttackApplyEvent
 */
export function generateCompleteAttackApplyEvent<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  eventNumber: number,
): CompleteAttackApplyEvent {
  const phaseState = getCurrentPhaseStateForBoard<TBoard>(state);

  if (phaseState.phase === "issueCommands") {
    const attackApply = getAttackApplyStateFromRangedAttack(state);
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      attackType: "ranged",
      defendingPlayer: attackApply.defendingUnit.playerSide,
    };
  }

  if (phaseState.phase === "resolveMelee") {
    const meleeState = getMeleeResolutionState(state);
    // Safe type broadening for more generic function signature
    const defendingPlayer = getDefendingPlayerForNextIncompleteMeleeAttackApply(
      state as GameState,
      meleeState as MeleeResolutionState,
    );

    if (defendingPlayer === null) {
      throw new Error("No incomplete attack apply state found in melee resolution");
    }

    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
      eventNumber,
      attackType: "melee",
      defendingPlayer,
    };
  }

  throw new Error(`completeAttackApply not expected in phase: ${phaseState.phase}`);
}
