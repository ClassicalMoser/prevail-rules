import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { isNone, isResolved } from '@utils';
import {
  getCurrentPhaseState,
  findGameOverWinner,
  isChoosingCardsInSecret,
} from '@queries';
import {
  getExpectedCleanupPhaseEvent,
  getExpectedIssueCommandsPhaseEvent,
  getExpectedMoveCommandersPhaseEvent,
  getExpectedPlayCardsPhaseEvent,
  getExpectedResolveMeleePhaseEvent,
  getExpectedSetupEvent,
} from './byPhase';

/**
 * Dispatcher function to identify which event to expect next.
 *
 * Opens with endgame checks (empty hand / unpayable rout discard), which wait
 * while the cards are still being chosen face down (§4.1.1). When the game is
 * already finished (`winner` set), nothing is expected and it returns
 * `undefined`; `getExpectedEvent` is the twin that insists. Otherwise
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
  if (isResolved(state.winner)) {
    return undefined;
  }

  // The cards are chosen at the same time and revealed together (§4.1.1,
  // §4.1.2), so a hand emptied by choosing is judged at the reveal. Judging
  // between the two choices would let the one that arrived first lose.
  const gameOverWinner = isChoosingCardsInSecret(state)
    ? undefined
    : findGameOverWinner(state);

  // A hand that has given out, a rout its owner cannot pay for, or an army
  // destroyed to the last unit ends the battle at once (§11), whatever the
  // phase was about to ask. The game owes the effect that records the winner;
  // the gameOver procedure names who it is.
  if (gameOverWinner !== undefined) {
    const gameOver: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'gameOver',
    };
    return gameOver;
  }

  // TODO(composition): the round's phase slot is read here directly, to tell
  // setup from play; DESIGN.md has only a query walk the state. A
  // `findCurrentPhaseState` in @queries, answering `undefined` before the
  // first phase, would settle it (isChoosingCardsInSecret walks the same slot).
  const rawPhase = state.currentRoundState.currentPhaseState;

  // Before the first phase it is round 0, setup: the side holding the
  // initiative places its army, then the other, and then the first round
  // begins (§3.5.4).
  let info: ExpectedEventInfo;
  if (isNone(rawPhase)) {
    info = getExpectedSetupEvent(state);
  } else {
    // In a round, the five phases each keep their own order of play (§4), so
    // each phase's own sequencer says what comes next within it.
    const phaseState = getCurrentPhaseState(state);

    switch (phaseState.phase) {
      // Phase 1: both players choose a card face down, then the reveal (§4.1).
      case 'playCards': {
        info = getExpectedPlayCardsPhaseEvent(state);
        break;
      }
      // Phase 2: the first player's general moves, then the second's (§4.2).
      case 'moveCommanders': {
        info = getExpectedMoveCommandersPhaseEvent(state);
        break;
      }
      // Phase 3: each player issues, then carries out, their orders (§4.3).
      case 'issueCommands': {
        info = getExpectedIssueCommandsPhaseEvent(state);
        break;
      }
      // Phase 4: every engagement is fought, in the first player's order (§4.4).
      case 'resolveMelee': {
        info = getExpectedResolveMeleePhaseEvent(state);
        break;
      }
      // Phase 5: cards leave play, then each player may rally (§4.5).
      case 'cleanup': {
        info = getExpectedCleanupPhaseEvent(state);
        break;
      }
      // A round has only those five phases; any other is a corrupt state.
      default: {
        throw new Error('Invalid phase');
      }
    }
  }

  // The event the game now waits for: a player's choice or an effect it owes.
  return info;
}
