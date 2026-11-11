import type { DoneIssuingCommandsEvent } from '@events';
import type { GameState } from '@game';
import { createDoneIssuingCommandsEvent } from '@factories';
import { getOtherPlayer } from '@queries';

/**
 * Legal `doneIssuingCommands` events for the active issue step.
 *
 * Always available while that player still has remaining command slots
 * (voluntary forfeit; also the only escape when no slot is issuable).
 *
 * `null` when done-issuing is not expected.
 */
export function getLegalDoneIssuingCommandsEvents(
  gameState: GameState,
): DoneIssuingCommandsEvent[] | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'issueCommands') {
    return null;
  }
  if (
    phaseState.step !== 'firstPlayerIssueCommands' &&
    phaseState.step !== 'secondPlayerIssueCommands'
  ) {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerIssueCommands' ? firstPlayer : secondPlayer;
  const remaining =
    phaseState.step === 'firstPlayerIssueCommands'
      ? phaseState.remainingCommandsFirstPlayer
      : phaseState.remainingCommandsSecondPlayer;

  if (remaining.length === 0) {
    return null;
  }

  return [
    createDoneIssuingCommandsEvent({
      player,
    }),
  ];
}
