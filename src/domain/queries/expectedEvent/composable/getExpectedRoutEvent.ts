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
  // Check if rout is completed (all work done, ready for parent to handle)
  if (routState.completed) {
    throw new Error('Rout state is already complete');
  }

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
  // Cards chosen but not completed - this shouldn't happen if completed is set correctly
  // But we'll throw an error to be safe
  throw new Error('Rout state has cards chosen but not marked as completed');
}
