import type { ChooseRallyEvent } from '@events';
import type { GameState } from '@game';
import { createChooseRallyEvent } from '@factories';
import {
  getCleanupPhaseState,
  getCurrentInitiative,
  getNextEventNumber,
  getOtherPlayer,
} from '@queries';

export function getLegalChooseRallyEvent(
  gameState: GameState,
): ChooseRallyEvent[] {
  // Make sure we're in the choose rally step
  const phaseState = getCleanupPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerChooseRally' &&
    phaseState.step !== 'secondPlayerChooseRally'
  ) {
    throw new Error('Not in choose rally step');
  }

  // Get the next event number
  const eventNumber = getNextEventNumber(gameState);

  // Get the first player
  const firstPlayer = getCurrentInitiative(gameState);

  // Build the result
  const result: ChooseRallyEvent[] = [];

  // If the active player is the first player, add a legal choose rally event
  if (phaseState.step === 'firstPlayerChooseRally') {
    for (const performRally of [true, false]) {
      result.push(
        createChooseRallyEvent({
          player: firstPlayer,
          eventNumber,
          performRally,
        }),
      );
    }
  }

  const secondPlayer = getOtherPlayer(firstPlayer);

  // If the active player is the second player, add a legal choose rally event
  if (phaseState.step === 'secondPlayerChooseRally') {
    for (const performRally of [true, false]) {
      result.push(
        createChooseRallyEvent({
          player: secondPlayer,
          eventNumber,
          performRally,
        }),
      );
    }
  }

  // Return the result
  return result;
}
