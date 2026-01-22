import type { Board, ExpectedEventInfo, RoutState } from '@entities';

/**
 * Gets the expected event for rout substeps.
 * This is a composable function that can be used in any context where
 * rout state appears (engagement resolution, rally resolution, etc.).
 *
 * @param routState - The rout state
 * @returns Information about what event is expected.
 */
export function getExpectedRoutEvent<TBoard extends Board>(
  routState: RoutState,
): ExpectedEventInfo<TBoard> {
  // Check if the unit has been routed yet
  if (routState.numberToDiscard === undefined) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    };
  }
  // Check if cards have been chosen
  if (!routState.cardsChosen) {
    return {
      actionType: 'playerChoice',
      playerSource: routState.player,
      choiceType: 'chooseRoutDiscard',
    };
  }
  // If cards have been chosen, expect resolve rout effect
  if (!routState.cardsDiscarded) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRoutDiscard',
    };
  }
  throw new Error('Rout state is complete');
}
