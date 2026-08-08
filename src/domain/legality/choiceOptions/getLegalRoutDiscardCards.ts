import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getOtherPlayer, getOwnedPlayerCardState } from '@queries';

/**
 * Atomic rout-discard options for UI and validation: which player must discard,
 * how many cards, and which hand card IDs may be chosen.
 *
 * `null` when a rout discard is not expected under this state/visibility.
 */
export interface LegalRoutDiscardCards {
  player: PlayerSide;
  numberToDiscard: number;
  /** Eligible card IDs from the discarding player's owned hand. */
  cardIds: readonly string[];
}

/**
 * Returns the atomic rout-discard selection context for cleanup resolveRally
 * when a rout substep is awaiting card selection.
 *
 * Does not expand combinations — callers pick `numberToDiscard` IDs from
 * {@link LegalRoutDiscardCards.cardIds}; {@link isValidChooseRoutDiscardEvent}
 * checks integrity of the committed set.
 *
 * Returns `null` when discard is not expected (wrong phase/step, pending rout,
 * cards already chosen, or the discarding player's hand is hidden).
 */
export function getLegalRoutDiscardCards<S extends GameState>(
  gameState: S,
): LegalRoutDiscardCards | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'cleanup') {
    return null;
  }
  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const activePlayer =
    phaseState.step === 'firstPlayerResolveRally' ? firstPlayer : secondPlayer;

  const rallyState =
    phaseState.step === 'firstPlayerResolveRally'
      ? phaseState.firstPlayerRallyResolutionState
      : phaseState.secondPlayerRallyResolutionState;

  if (rallyState === 'pending' || rallyState.routState === 'pending') {
    return null;
  }

  const { routState } = rallyState;
  if (
    routState.cardsChosen ||
    routState.completed ||
    routState.numberToDiscard === 'pending' ||
    routState.player !== activePlayer
  ) {
    return null;
  }

  let cardIds: string[];
  try {
    cardIds = getOwnedPlayerCardState(
      gameState.cardState,
      routState.player,
    ).inHand.map((card) => card.id);
  } catch {
    // Discarding player's hand is hidden under this visibility.
    return null;
  }

  return {
    cardIds,
    numberToDiscard: routState.numberToDiscard,
    player: routState.player,
  };
}
