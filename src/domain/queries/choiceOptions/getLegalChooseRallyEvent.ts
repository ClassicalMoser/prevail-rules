import type { Board } from '@entities';
import type { ChooseRallyEvent } from '@events';
import type { GameStateWithBoard } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import {
  getCleanupPhaseState,
  getCurrentInitiative,
  getNextEventNumber,
} from '@queries/sequencing';

export function getLegalChooseRallyEvent<TBoard extends Board>(
  gameState: GameStateWithBoard<TBoard>,
): ChooseRallyEvent<TBoard>[] {
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
  const result: ChooseRallyEvent<TBoard>[] = [];

  // If the active player is the first player, add a legal choose rally event
  if (phaseState.step === 'firstPlayerChooseRally') {
    for (const performRally of [true, false]) {
      result.push({
        eventNumber,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: 'chooseRally',
        player: firstPlayer,
        performRally,
      });
    }
  }

  const secondPlayer = getOtherPlayer(firstPlayer);

  // If the active player is the second player, add a legal choose rally event
  if (phaseState.step === 'secondPlayerChooseRally') {
    for (const performRally of [true, false]) {
      result.push({
        eventNumber,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: 'chooseRally',
        player: secondPlayer,
        performRally,
      });
    }
  }

  // Return the result
  return result;
}
