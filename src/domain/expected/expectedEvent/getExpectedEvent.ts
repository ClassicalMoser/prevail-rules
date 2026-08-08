import type { ExpectedEvent, ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getCurrentPhaseState, getGameOverWinner } from '@queries';
import {
  getExpectedCleanupPhaseEvent,
  getExpectedIssueCommandsPhaseEvent,
  getExpectedMoveCommandersPhaseEvent,
  getExpectedPlayCardsPhaseEvent,
  getExpectedResolveMeleePhaseEvent,
  getExpectedSetupUnitsEvent,
} from './byPhase';

/**
 * Dispatcher function to identify which event to expect next.
 *
 * Opens with endgame checks (empty hand / unpayable rout discard). When the
 * game is already finished (`winner` set), throws. Otherwise routes by phase.
 * Optional commit discards are never treated as forced costs.
 *
 * @param state - The game state, only argument required.
 * @returns Discriminator information to identify which event and number to expect next,
 * as well as which player(s) to expect input from.
 */
export function getExpectedEvent(state: GameState): ExpectedEvent {
  const eventNumber = state.currentRoundState.events.length;

  if (state.winner !== undefined) {
    throw new Error('Game is already over');
  }

  const gameOverWinner = getGameOverWinner(state);
  if (gameOverWinner !== undefined) {
    return {
      actionType: 'gameEffect',
      effectType: 'gameOver',
      expectedEventNumber: eventNumber,
    };
  }

  const rawPhase = state.currentRoundState.currentPhaseState;

  // Pre-round deployment: place reserved units before any phase starts.
  let info: ExpectedEventInfo;
  if (rawPhase === 'none') {
    info = getExpectedSetupUnitsEvent(state);
  } else {
    const phaseState = getCurrentPhaseState(state);

    switch (phaseState.phase) {
      case 'playCards': {
        info = getExpectedPlayCardsPhaseEvent(state);
        break;
      }
      case 'moveCommanders': {
        info = getExpectedMoveCommandersPhaseEvent(state);
        break;
      }
      case 'issueCommands': {
        info = getExpectedIssueCommandsPhaseEvent(state);
        break;
      }
      case 'resolveMelee': {
        info = getExpectedResolveMeleePhaseEvent(state);
        break;
      }
      case 'cleanup': {
        info = getExpectedCleanupPhaseEvent(state);
        break;
      }
      default: {
        throw new Error('Invalid phase');
      }
    }
  }

  return {
    ...info,
    expectedEventNumber: eventNumber,
  };
}
