import type { ExpectedEventInfo } from '@events';
import type { ReverseState } from '@game';

/**
 * Gets the expected event for reverse substeps.
 * This is a composable function that can be used in any context where
 * reverse state appears (ranged attack resolution, etc.).
 *
 * Takes the reverse state alone and no game state. Whether the unit can turn
 * is decided when the event is generated, so nothing here needs to see the board.
 *
 * @param reverseState - The reverse state
 * @returns Information about what event is expected
 */
export function getExpectedReverseEvent(
  reverseState: ReverseState,
): ExpectedEventInfo {
  // A unit that has turned has nothing left to do here; the parent moves on.
  if (reverseState.completed) {
    throw new Error('Reverse state is already complete');
  }

  // The turn is deterministic, so the engine resolves it.
  // A reverse turns the unit 180° where it stands (§9.2.1), and a unit still
  // sharing its space with an enemy holds its facing instead (§7.5.5). Either
  // way nobody chooses anything, so the same effect carries it out.
  const turnAbout: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'resolveReverse',
  };
  return turnAbout;
}
