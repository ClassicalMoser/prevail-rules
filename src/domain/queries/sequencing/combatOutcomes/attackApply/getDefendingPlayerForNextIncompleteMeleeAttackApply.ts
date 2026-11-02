import type { PlayerSide } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { getOtherPlayer } from '@queries/player';

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

  const firstPlayerAttackApplyState =
    meleeState[`${firstPlayer}AttackApplyState`];
  const secondPlayerAttackApplyState =
    meleeState[`${secondPlayer}AttackApplyState`];

  // Initiative order only applies once both applies have been opened.
  if (
    firstPlayerAttackApplyState === 'pending' ||
    secondPlayerAttackApplyState === 'pending'
  ) {
    return null;
  }

  if (!firstPlayerAttackApplyState.completed) {
    return firstPlayer;
  }

  if (!secondPlayerAttackApplyState.completed) {
    return secondPlayer;
  }

  // Both applies are finished.
  return null;
}
