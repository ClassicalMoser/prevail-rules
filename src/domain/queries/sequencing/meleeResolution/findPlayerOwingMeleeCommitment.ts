import type { PlayerSide } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { getOtherPlayer } from '@queries/player';

/**
 * The player whose commitment to a melee is next owed (§7.2.2). Each player
 * may commit a card for their unit before the blows are counted, the first
 * player first and the second after; once both have committed or refused,
 * nobody is asked.
 *
 * Both the sequencer (which choice is expected) and the legal options (which
 * events may be sent) need this order, and it is stated here once.
 *
 * @param gameState - The game state, for who is the first player
 * @param meleeState - The melee being fought
 * @returns The player to ask, or `undefined` when both have answered
 */
export function findPlayerOwingMeleeCommitment(
  gameState: GameState,
  meleeState: MeleeResolutionState,
): PlayerSide | undefined {
  const firstPlayer = gameState.currentInitiative;
  if (meleeState.firstPlayerCommitment.commitmentType === 'pending') {
    return firstPlayer;
  }
  if (meleeState.secondPlayerCommitment.commitmentType === 'pending') {
    const secondPlayer = getOtherPlayer(firstPlayer);
    return secondPlayer;
  }
  return undefined;
}
