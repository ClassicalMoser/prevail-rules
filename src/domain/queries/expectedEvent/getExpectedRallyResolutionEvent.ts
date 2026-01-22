import type { Board, ExpectedEventInfo, RallyResolutionState } from '@entities';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

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
    return getExpectedRoutEvent(rallyState.routState);
  }

  // Rally fully resolved, should have advanced to next step
  throw new Error('Rally resolution complete but step not advanced');
}
