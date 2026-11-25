import type { HiddenCardState, OwnedCardState } from '@game';

/**
 * Converts an owned card slice to the hidden perspective: hand and awaiting-play
 * identities become `HiddenCard` placeholders; already-public piles stay.
 *
 * Hands are secret, and so is a card played face down until it is revealed
 * (§1.4); everything else about a player's cards is on the table. The
 * projections for a seat or a spectator (`projectWhiteSeenGameState`,
 * `projectBlackSeenGameState`, `projectSpectatorGameState`) call it.
 *
 * @param owned - A player's cards as the full record holds them
 * @returns The same cards as a viewer who cannot see the hand holds them
 */
export function toHiddenCardState(owned: OwnedCardState): HiddenCardState {
  // A face-down card shows that it is there, not which card it is.
  const awaitingPlay = owned.awaitingPlay === null ? null : 'hidden';

  // The hand keeps its size, so the viewer still sees how many cards it
  // holds, which is how near the player is to losing (§11.1).
  const inHand = owned.inHand.map(() => 'hidden' as const);

  // The card in play and the played, discarded and burnt piles are face up
  // for everyone.
  const hidden: HiddenCardState = {
    awaitingPlay,
    burnt: owned.burnt,
    discarded: owned.discarded,
    inHand,
    inPlay: owned.inPlay,
    played: owned.played,
  };
  return hidden;
}
