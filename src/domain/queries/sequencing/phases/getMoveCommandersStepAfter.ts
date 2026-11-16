import type { MoveCommandersPhaseStep } from '@game';

/**
 * The Move Commanders step after a player's turn (§4.2.1): the first player
 * moves their commander, then the second, and then the phase is done. A turn
 * passes on in the same way whether the commander moved or its move was
 * passed over because it has fallen (§4.2.8).
 *
 * @param step - The turn just taken
 * @returns The second player's turn after the first's, and the end of the phase after the second's
 * @throws Error on the complete step, which has no turn after it
 */
export function getMoveCommandersStepAfter(
  step: MoveCommandersPhaseStep,
): MoveCommandersPhaseStep {
  // The first player's turn passes to the second player's.
  if (step === 'moveFirstCommander') {
    return 'moveSecondCommander';
  }

  // The second player's turn ends the phase.
  if (step === 'moveSecondCommander') {
    return 'complete';
  }

  // Once the phase is done, no turn follows.
  throw new Error('Move Commanders is complete; no turn follows');
}
