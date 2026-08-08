import type { ExpectedEvent, ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getCurrentPhaseState } from '@queries';
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
 * @param state - The game state, only argument required.
 * @returns Discriminator information to identify which event and number to expect next,
 * as well as which player(s) to expect input from.
 */
export function getExpectedEvent(state: GameState): ExpectedEvent {
  const eventNumber = state.currentRoundState.events.length;
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
