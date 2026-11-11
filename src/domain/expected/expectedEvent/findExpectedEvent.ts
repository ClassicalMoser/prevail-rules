import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import {
  getCurrentPhaseState,
  getGameOverWinner,
  isChoosingCardsInSecret,
} from '@queries';
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
 * Opens with endgame checks (empty hand / unpayable rout discard), which wait
 * while the cards are still being chosen face down (§4.1.1). When the game is
 * already finished (`winner` set), nothing is expected and it returns
 * `undefined`; {@link getExpectedEvent} is the twin that insists. Otherwise
 * routes by phase. Optional commit discards are never treated as forced costs.
 *
 * @param state - The game state, only argument required.
 * @returns Discriminator information to identify which event to expect next,
 * as well as which player(s) to expect input from; `undefined` once the game
 * is over.
 */
export function findExpectedEvent(
  state: GameState,
): ExpectedEventInfo | undefined {
  // A finished game expects nothing: nobody is owed a choice and no effect is due.
  if (state.winner !== undefined) {
    return undefined;
  }

  // The cards are chosen at the same time and revealed together (§4.1.1,
  // §4.1.2), so a hand emptied by choosing is judged at the reveal. Judging
  // between the two choices would let the one that arrived first lose.
  const gameOverWinner = isChoosingCardsInSecret(state)
    ? undefined
    : getGameOverWinner(state);
  if (gameOverWinner !== undefined) {
    return {
      actionType: 'gameEffect',
      effectType: 'gameOver',
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

  return info;
}
