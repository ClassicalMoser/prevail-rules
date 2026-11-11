import type { DoneIssuingCommandsEvent } from '@events';
import type { GameState } from '@game';
import { createDoneIssuingCommandsEvent } from '@factories';
import {
  getIssueCommandsPhaseState,
  getOtherPlayer,
  getRemainingCommandsForPlayer,
} from '@queries';

/**
 * Legal `doneIssuingCommands` events for the active issue step.
 *
 * Always available while that player still has remaining command slots
 * (voluntary forfeit; also the only escape when no slot is issuable).
 *
 * The expected engine asks for it only on an issuing step with orders left,
 * so being asked anywhere else is the caller's mistake and throws.
 *
 * @throws Error outside the issue commands phase, off an issuing step, or
 * when the issuing player has no orders left
 */
export function getLegalDoneIssuingCommandsEvents(
  gameState: GameState,
): DoneIssuingCommandsEvent[] {
  const phaseState = getIssueCommandsPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerIssueCommands' &&
    phaseState.step !== 'secondPlayerIssueCommands'
  ) {
    throw new Error(`Not on an issuing step: ${phaseState.step}`);
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerIssueCommands' ? firstPlayer : secondPlayer;
  const remaining = getRemainingCommandsForPlayer(gameState, player);

  // With every order issued the step should already have moved on to
  // resolving them.
  if (remaining.length === 0) {
    throw new Error(`${player} has no orders left to forfeit`);
  }

  const done = [
    createDoneIssuingCommandsEvent({
      player,
    }),
  ];
  return done;
}
