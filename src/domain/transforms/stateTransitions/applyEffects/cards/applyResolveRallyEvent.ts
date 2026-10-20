import type { PlayerSide } from '@entities';
import type { ResolveRallyEvent } from '@events';
import type { CardState, GameState, RallyResolutionState } from '@game';
import {
  getCleanupPhaseState,
  getHiddenPlayerCardState,
  getOwnedPlayerCardState,
  getRallyResolutionStateAwaitingBurn,
} from '@queries';
import { updateRallyResolutionStateForCurrentStep } from '@transforms/pureTransforms/sequencing/updateRallyResolutionStateForCurrentStep';
import {
  burnCardFromPlayed,
  burnHiddenCardFromPlayed,
  replaceHiddenPlayerCardState,
  replaceOwnedPlayerCardState,
  returnCardsToHand,
  returnHiddenCardsToHand,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * True when `player` is an unowned slice under this card-state visibility.
 * Authoritative games have no hidden seat. A spectator hides both seats.
 */
function eventPlayerIsHidden(
  cardState: CardState,
  player: PlayerSide,
): boolean {
  switch (cardState.visibility) {
    case 'authoritative': {
      return false;
    }
    case 'whiteSeen': {
      return player === 'black';
    }
    case 'blackSeen': {
      return player === 'white';
    }
    case 'spectator': {
      // Both hands are hidden, so a rally burn uses the hidden-card path.
      return true;
    }
    default: {
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}

/**
 * Burns `card` and returns the rest of played and discarded to hand.
 * An owned slice keeps card identities. A hidden slice keeps the burnt card
 * public and turns the returned cards into `'hidden'` placeholders.
 */
function cardStateAfterRallyBurn(
  cardState: CardState,
  player: PlayerSide,
  card: ResolveRallyEvent['card'],
): CardState {
  if (eventPlayerIsHidden(cardState, player)) {
    const hidden = getHiddenPlayerCardState(cardState, player);
    const burned = burnHiddenCardFromPlayed(hidden, card);
    const returned = returnHiddenCardsToHand(burned);
    const next = replaceHiddenPlayerCardState(cardState, player, returned);
    return next;
  }

  const owned = getOwnedPlayerCardState(cardState, player);
  const burned = burnCardFromPlayed(owned, card);
  const returned = returnCardsToHand(burned);
  const next = replaceOwnedPlayerCardState(cardState, player, returned);
  return next;
}

/**
 * Applies a ResolveRallyEvent to the game state.
 * Burns the specified card from the played pile, then returns all remaining played
 * and discarded cards to the player's hand.
 * Marks `rallyResolved` and stays on the resolve-rally step with
 * `unitsLostSupport: 'pending'` so {@link applyAssignUnitSupportEvent} can run next.
 * Uses {@link getRallyResolutionStateAwaitingBurn} for sequencing invariants.
 *
 * Works for the owned slice and for the opponent's hidden slice on a seat view.
 * On a hidden slice the burnt card stays public; cards returned to hand become
 * `'hidden'` placeholders.
 */
export function applyResolveRallyEvent<S extends GameState>(
  event: ResolveRallyEvent,
  state: S,
): S {
  const { player, card } = event;
  const phaseState = getCleanupPhaseState(state);

  const rallyState = getRallyResolutionStateAwaitingBurn(state, player);
  const cardState = cardStateAfterRallyBurn(state.cardState, player, card);

  const stateWithCards = {
    ...state,
    cardState,
  };

  const updatedRallyResolutionState: RallyResolutionState = {
    ...rallyState,
    rallyResolved: true,
    // Still pending — populated by applyAssignUnitSupportEvent, not here.
    unitsLostSupport: 'pending',
    routState: 'pending',
  };

  const newPhaseState = updateRallyResolutionStateForCurrentStep(
    phaseState,
    updatedRallyResolutionState,
    phaseState.step,
  );

  return updatePhaseState(stateWithCards, newPhaseState);
}
