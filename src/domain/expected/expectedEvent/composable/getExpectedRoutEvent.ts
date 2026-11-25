import type { ExpectedEventInfo } from '@events';
import type { RoutState } from '@game';
import { isPending } from '@utils';

/**
 * Gets the expected event for rout substeps.
 * This is a composable function that can be used in any context where
 * rout state appears (engagement resolution, rally resolution, etc.).
 *
 * @param routState - The rout state
 * @returns Information about what event is expected.
 */
export function getExpectedRoutEvent(routState: RoutState): ExpectedEventInfo {
  // Check if rout is completed (all work done, ready for parent to handle)
  // A paid rout has nothing left to ask for. Every parent checks for that
  // before calling here, so a call now is the parent's fault.
  if (routState.completed) {
    throw new Error('Rout state is already complete');
  }

  // Check if the unit has been routed yet
  // A routed unit costs its owner its Morale in cards (§9.3.2), summed when
  // several rout at once (§9.3.3). Counting it is the engine's work, and a
  // debt of zero settles the rout in the same effect.
  if (isPending(routState.numberToDiscard)) {
    const countMorale: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    };
    return countMorale;
  }

  // Check if cards have been chosen
  // The owner chooses which cards to discard, freely from their hand
  // (§9.3.2), so the payment waits on them.
  if (!routState.cardsChosen) {
    const payMorale: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      playerSource: routState.player,
    };
    return payMorale;
  }

  // Cards chosen but not completed - this shouldn't happen if completed is set correctly
  // But we'll throw an error to be safe
  // Applying the discard choice marks the rout complete in the same write, so
  // a paid rout left open is a fault in that apply.
  throw new Error('Rout state has cards chosen but not marked as completed');
}
