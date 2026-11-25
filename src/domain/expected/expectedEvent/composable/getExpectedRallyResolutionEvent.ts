import type { ExpectedEventInfo, PlayerSource } from '@events';
import type { RallyResolutionState } from '@game';
import { isOpenSubstep } from '@queries';
import { isPending } from '@utils';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for rally resolution substeps.
 * This is a composable function that can be used in any context where
 * rally resolution state appears.
 *
 * @param rallyState - The rally resolution state
 * @param player - The player whose rally is being resolved (for support assignment)
 * @returns Information about what event is expected
 */
export function getExpectedRallyResolutionEvent(
  rallyState: RallyResolutionState,
  player: PlayerSource,
): ExpectedEventInfo {
  // Fast rejection: if already completed, this is an invalid state
  // A finished rally moves cleanup on in the same write, so the cleanup
  // sequencer never asks about one.
  if (rallyState.completed) {
    throw new Error('Rally resolution state is already complete');
  }

  // Check substep progression
  // A rally first burns one played card at random and takes every other
  // played and discarded card back into hand (§10.3.2). The draw is the
  // engine's. Only a player who chose to rally reaches this step: declining
  // skips it (§10.3.4).
  if (!rallyState.rallyResolved) {
    const burnAndReturn: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'resolveRally',
    };
    return burnAndReturn;
  }

  // With every card back in hand, the rallying player assigns their units to
  // the places their cards hold (§10.4.4). Anyone left without a place routs.
  if (isPending(rallyState.unitsLostSupport)) {
    const assignSupport: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'assignUnitSupport',
      playerSource: player,
    };
    return assignSupport;
  }

  // Units left without a place rout together, and their owner pays their
  // summed Morale at once (§10.4.6, §10.4.7).
  if (rallyState.unitsLostSupport.length > 0) {
    // The support assignment opens that rout in the same write that records
    // who lost support, so a missing one is a fault there.
    if (!isOpenSubstep(rallyState.routState)) {
      throw new Error('Rout state is required when units lost support');
    }
    // Check if rout is completed
    if (!rallyState.routState.completed) {
      const payForRouts = getExpectedRoutEvent(rallyState.routState);
      return payForRouts;
    }
    // Rout is complete, rally resolution should be complete (all nested work done)
    throw new Error('Rally resolution complete but step not advanced');
  }

  // No units lost support, rally fully resolved, should have advanced to next step
  throw new Error('Rally resolution complete but step not advanced');
}
