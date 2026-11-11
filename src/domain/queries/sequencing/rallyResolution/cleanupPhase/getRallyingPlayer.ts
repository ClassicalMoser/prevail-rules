import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getCleanupPhaseState } from '@queries/sequencing/phases/getCleanupPhaseState';
import { findRallyingPlayer } from './findRallyingPlayer';

/**
 * The player whose rally the cleanup step is on. The first player chooses
 * whether to rally and carries it out, then the second does the same
 * (§10.3), so each choose and resolve step belongs to one of them.
 *
 * This is the one statement of which rally a step belongs to; every reader
 * and writer of a rally asks it.
 *
 * @param state - The game state, in a rally step of cleanup
 * @returns The player choosing or resolving a rally now
 * @throws Error when cleanup is not on a rally step
 */
export function getRallyingPlayer(state: GameState): PlayerSide {
  const player = findRallyingPlayer(state);
  if (player === undefined) {
    const { step } = getCleanupPhaseState(state);
    throw new Error(`Cleanup phase is not on a rally step: ${step}`);
  }
  return player;
}
