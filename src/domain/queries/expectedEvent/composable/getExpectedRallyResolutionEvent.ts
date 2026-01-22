import type { Board, ExpectedEventInfo, RallyResolutionState } from '@entities';
import { getExpectedRoutEvent } from '.';

/**
 * Gets the expected event for rally resolution substeps.
 * This is a composable function that can be used in any context where
 * rally resolution state appears.
 *
 * @param rallyState - The rally resolution state
 * @returns Information about what event is expected
 */
export function getExpectedRallyResolutionEvent<TBoard extends Board>(
  rallyState: RallyResolutionState,
): ExpectedEventInfo<TBoard> {
  // Fast rejection: if already completed, this is an invalid state
  if (rallyState.completed) {
    throw new Error('Rally resolution state is already complete');
  }

  // Check substep progression
  if (!rallyState.rallyResolved) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRally',
    };
  }

  if (rallyState.unitsLostSupport === undefined) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveUnitsBroken',
    };
  }

  if (rallyState.unitsLostSupport.size > 0) {
    if (rallyState.routState === undefined) {
      throw new Error('Rout state is required when units lost support');
    }
    // Check if rout is completed
    if (!rallyState.routState.completed) {
      return getExpectedRoutEvent(rallyState.routState);
    }
    // Rout is complete, rally resolution should be complete (all nested work done)
    throw new Error('Rally resolution complete but step not advanced');
  }

  // No units lost support, rally fully resolved, should have advanced to next step
  throw new Error('Rally resolution complete but step not advanced');
}
