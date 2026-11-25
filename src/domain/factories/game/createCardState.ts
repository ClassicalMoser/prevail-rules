import type { PlayerSide } from '@entities';
import type { AuthoritativeCardState, OwnedCardState } from '@game';
/**
 * An authoritative card state from both players' piles.
 *
 * Authoritative because that is the state an engine creates. A seat's view or a
 * spectator's is derived from it by `projectGameStateForVisibility`, never built.
 *
 * @param sides - The piles to set, per side
 * @returns The authoritative card state
 */
export function createCardState(
  sides: Record<PlayerSide, OwnedCardState>,
): AuthoritativeCardState {
  // Each side's piles as given, in the engine's own full view.
  const cardState: AuthoritativeCardState = {
    visibility: 'authoritative',
    white: sides.white,
    black: sides.black,
  };
  return cardState;
}
