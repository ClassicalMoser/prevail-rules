import type { GameState, MoveCommandersPhaseStep } from '@game';
import { getOtherPlayer } from '@queries/player/getOtherPlayer';

/**
 * The Move Commanders step play comes to from the given one (§4.2.1): the
 * first player moves their commander, then the second. A side whose
 * commander has fallen has nothing to move (§4.2.8), so its turn is passed
 * over — to the second player's, or to the end of the phase.
 *
 * @param state - The game state, which records whose commanders are lost
 * @param step - The step play would come to next if both commanders stood
 * @returns That step, or the first one after it whose commander still stands
 */
export function getMoveCommandersStepFrom(
  state: GameState,
  step: MoveCommandersPhaseStep,
): MoveCommandersPhaseStep {
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  // The first player's turn passes if their commander has fallen.
  const afterFirst =
    step === 'moveFirstCommander' && state.lostCommanders.includes(firstPlayer)
      ? 'moveSecondCommander'
      : step;

  // And so does the second player's, ending the phase.
  const afterSecond =
    afterFirst === 'moveSecondCommander' &&
    state.lostCommanders.includes(secondPlayer)
      ? 'complete'
      : afterFirst;
  return afterSecond;
}
