import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { updatePhaseState, updateRoutState } from '@transforms';

import { createCleanupPhaseStateWithRallyRout } from './phaseStateHelpers/phaseStates';
import { createRoutState } from './phaseStateHelpers/substepStates';
import { createTestUnit } from './unitHelpers';

/**
 * A game in Cleanup with one player's rally accepted and a rout owing a
 * known number of cards, not yet chosen. For a spec about whether that
 * discard can be paid, so the rest of the game is the state it is given.
 *
 * The cleanup fixture only opens a rout slot, and `updateRoutState` writes
 * over an open rout rather than creating one, so the rout is opened first and
 * its penalty written after.
 *
 * @param state - The game, with the hands the spec chose
 * @param player - The player whose unit routed and who owes the discard
 * @param numberToDiscard - How many cards the rout costs
 * @returns That game, on the player's rally with the discard owing
 */
export function withRoutOwing<S extends GameState>(
  state: S,
  player: PlayerSide,
  numberToDiscard: number,
): S {
  // One of the player's units has routed at the rally's support check.
  const routing = createTestUnit(player);

  // The rally is accepted, and the rout is open on it.
  const opened = createRoutState(player, routing);
  const rally = createCleanupPhaseStateWithRallyRout(state, opened);
  const cleanup = updatePhaseState(state, rally);

  // The penalty is known and the cards are not yet chosen.
  const owed = createRoutState(player, routing, {
    cardsChosen: false,
    numberToDiscard,
  });
  const owing = updateRoutState(cleanup, owed);
  return owing;
}
