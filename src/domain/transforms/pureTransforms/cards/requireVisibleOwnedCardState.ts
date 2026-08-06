import type { HiddenCardState, OwnedCardState } from '@entities';

/**
 * Narrows a player card slice to {@link OwnedCardState} when the hand (and
 * awaiting-play slot) contain no hidden sentinels.
 *
 * @throws if any hand card or awaitingPlay is `'hidden'`
 */
export function requireVisibleOwnedCardState(
  playerState: HiddenCardState | OwnedCardState,
): OwnedCardState {
  if (
    playerState.inHand.some((card) => card === 'hidden') ||
    playerState.awaitingPlay === 'hidden'
  ) {
    throw new Error('Player card state is not fully visible');
  }
  return playerState as OwnedCardState;
}
