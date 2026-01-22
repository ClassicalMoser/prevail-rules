import type { Board, ExpectedEventInfo, ReverseState } from '@entities';

/**
 * Gets the expected event for reverse substeps.
 * This is a composable function that can be used in any context where
 * reverse state appears (ranged attack resolution, etc.).
 *
 * @param reverseState - The reverse state
 * @returns Information about what event is expected
 */
export function getExpectedReverseEvent<TBoard extends Board>(
  reverseState: ReverseState<TBoard>,
): ExpectedEventInfo<TBoard> {
  // Check if the final position has been determined
  if (reverseState.finalPosition === undefined) {
    // Reverse is deterministic - expect resolve reverse effect
    return {
      actionType: 'gameEffect',
      effectType: 'resolveReverse',
    };
  }
  // Reverse complete
  throw new Error('Reverse state is complete');
}
