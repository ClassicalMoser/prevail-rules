import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Gets which player currently has initiative.
 *
 * @param state - The game state
 * @returns The player side with initiative
 */
export function getCurrentInitiative(state: GameState): PlayerSide {
  // TODO(composition): two dozen production modules read `currentInitiative`
  // off the state directly, among them `getCommandingPlayer`,
  // `findRallyingPlayer` and `findPlayerOwingMeleeCommitment` in this folder;
  // only `getLegalChooseMeleeResolutionEvents` asks here. Settle whether this
  // reader stays, and if so route those reads through it.
  // The side that took initiative when the cards were revealed (§4.1.3) acts
  // first in every phase that has an order this round (§4.1.5).
  const initiative = state.currentInitiative;

  // The first player for the rest of the round.
  return initiative;
}
