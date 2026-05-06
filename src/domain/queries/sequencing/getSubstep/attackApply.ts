import type { Board, PlayerSide } from "@entities";
import type {
  AttackApplyStateForBoard,
  GameState,
  GameStateForBoard,
  MeleeResolutionState,
} from "@game";
import { getOtherPlayer } from "@queries/getOtherPlayer";
import {
  getMeleeResolutionState,
  getRangedAttackResolutionState,
} from "../getCommandResolutionState";

/**
 * Gets the attack apply state from a ranged attack resolution.
 * Assumes we're resolving a ranged attack with an attack apply state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The attack apply state
 * @throws Error if not resolving a ranged attack or attack apply state is missing
 */
export function getAttackApplyStateFromRangedAttack<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): AttackApplyStateForBoard<TBoard> {
  const rangedAttackState = getRangedAttackResolutionState(state);
  if (!rangedAttackState.attackApplyState) {
    throw new Error("No attack apply state found in ranged attack resolution");
  }
  return rangedAttackState.attackApplyState;
}

/**
 * Gets the attack apply state from melee resolution for a specific player.
 * Assumes we're in resolveMelee phase with a melee resolution state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The attack apply state for the player
 * @throws Error if not in resolveMelee phase or attack apply state is missing
 */
export function getAttackApplyStateFromMelee<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  player: "white" | "black",
): AttackApplyStateForBoard<TBoard> {
  const meleeState = getMeleeResolutionState(state);
  const attackApplyState =
    player === "white" ? meleeState.whiteAttackApplyState : meleeState.blackAttackApplyState;
  if (!attackApplyState) {
    throw new Error(`No ${player} attack apply state found in melee resolution`);
  }
  return attackApplyState;
}

/**
 * The defending player side for the next incomplete melee attack-apply substep,
 * in initiative order (matches `getExpectedMeleeResolutionEvent` when both apply states exist).
 *
 * @returns `null` if either attack-apply state is missing, or both are already complete
 */
export function getDefendingPlayerForNextIncompleteMeleeAttackApply(
  gameState: GameState,
  meleeState: MeleeResolutionState,
): PlayerSide | null {
  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  const firstPlayerAttackApplyState = meleeState[`${firstPlayer}AttackApplyState`];
  const secondPlayerAttackApplyState = meleeState[`${secondPlayer}AttackApplyState`];

  if (!firstPlayerAttackApplyState || !secondPlayerAttackApplyState) {
    return null;
  }

  if (!firstPlayerAttackApplyState.completed) {
    return firstPlayer;
  }

  if (!secondPlayerAttackApplyState.completed) {
    return secondPlayer;
  }

  return null;
}
