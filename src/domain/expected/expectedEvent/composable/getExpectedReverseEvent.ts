import type { ExpectedEventInfo } from '@events';
import type { ReverseState } from '@game';

/**
 * Gets the expected event for reverse substeps.
 * This is a composable function that can be used in any context where
 * reverse state appears (ranged attack resolution, etc.).
 *
 * Takes the reverse state alone and no game state: the engagement check is the
 * caller's responsibility, so nothing here needs to see the board.
 *
 * @param reverseState - The reverse state
 * @returns Information about what event is expected
 */
export function getExpectedReverseEvent(
  reverseState: ReverseState,
): ExpectedEventInfo {
  // Check if reverse is completed (all work done, ready for parent to handle)
  if (reverseState.completed) {
    throw new Error('Reverse state is already complete');
  }

  // Check if the final position has been determined
  if (reverseState.finalPosition === 'pending') {
    // Reverse is deterministic - expect resolve reverse effect
    return {
      actionType: 'gameEffect',
      effectType: 'resolveReverse',
    };
  }
  // Final position determined but not completed - this shouldn't happen if completed is set correctly
  // But we'll throw an error to be safe
  throw new Error(
    'Reverse state has final position but not marked as completed',
  );
}
