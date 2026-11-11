import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getOtherPlayer } from '@queries/player';
import { getCleanupPhaseState } from '@queries/sequencing/phases/getCleanupPhaseState';

/**
 * The player whose rally the cleanup step is on, or `undefined` on the steps
 * that belong to nobody's rally. The first player chooses whether to rally and
 * carries it out, then the second does the same (§10.3); discarding the played
 * cards comes before both, and completing the round after.
 *
 * Callers that know the step is a rally step use `getRallyingPlayer`.
 *
 * @param state - The game, in cleanup
 * @returns The player choosing or resolving a rally now, or `undefined`
 * @throws Error when the game is not in cleanup
 */
export function findRallyingPlayer(state: GameState): PlayerSide | undefined {
  const { step } = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  if (step === 'firstPlayerChooseRally' || step === 'firstPlayerResolveRally') {
    return firstPlayer;
  }
  if (
    step === 'secondPlayerChooseRally' ||
    step === 'secondPlayerResolveRally'
  ) {
    const secondPlayer = getOtherPlayer(firstPlayer);
    return secondPlayer;
  }
  return undefined;
}
