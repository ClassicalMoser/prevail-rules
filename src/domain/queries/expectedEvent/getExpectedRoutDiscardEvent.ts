import type { Board, ExpectedEventInfo, RoutDiscardState } from '@entities';

/**
 * Gets the expected event for rout discard substeps.
 * This is a composable function that can be used in any context where
 * rout discard state appears (engagement resolution, rally resolution, etc.).
 *
 * @param routDiscardState - The rout discard state
 * @returns Information about what event is expected, or undefined if rout discard is complete
 */
export function getExpectedRoutDiscardEvent<TBoard extends Board>(
  routDiscardState: RoutDiscardState,
): ExpectedEventInfo<TBoard> {
  // Check if cards have been chosen
  if (!routDiscardState.cardsChosen) {
    return {
      actionType: 'playerChoice',
      playerSource: routDiscardState.player,
      choiceType: 'chooseRoutDiscard',
    };
  }
  // If cards have been chosen, expect resolve rout discard effect
  if (!routDiscardState.cardsDiscarded) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRoutDiscard',
    };
  }
  throw new Error('Rout discard state is complete');
}
