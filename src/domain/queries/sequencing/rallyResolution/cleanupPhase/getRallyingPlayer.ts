import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getOtherPlayer } from '@queries/player';
import { getCleanupPhaseState } from '@queries/sequencing/phases/getCleanupPhaseState';

/**
 * The player whose rally the cleanup step is on. The first player chooses
 * whether to rally and carries it out, then the second does the same
 * (§10.3), so each choose and resolve step belongs to one of them.
 *
 * @param state - The game, in a rally step of cleanup
 * @returns The player choosing or resolving a rally now
 * @throws Error when cleanup is not on a rally step
 */
export function getRallyingPlayer(state: GameState): PlayerSide {
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
  throw new Error(`Cleanup phase is not on a rally step: ${step}`);
}
