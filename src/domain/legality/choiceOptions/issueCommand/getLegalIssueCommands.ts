import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getOtherPlayer } from '@queries';

/**
 * Atomic issue-command context: which player may issue, and which remaining
 * commands they may still spend.
 *
 * Eligible units/lines for a chosen command are enumerated separately via
 * {@link getLegalUnitsForIssueCommand} (units / line starts) and
 * {@link getLegalLineEndsForIssueCommand} (ends for a start).
 *
 * `null` when an issueCommand choice is not expected.
 */
export interface LegalIssueCommands {
  player: PlayerSide;
  commands: readonly Command[];
}

/**
 * Returns remaining commands for the active issue-commands step.
 *
 * Does not expand unit/line combinations — callers pick a command, then
 * eligible atoms under that command's restrictions; {@link isValidIssueCommandEvent}
 * checks integrity of the committed set.
 */
export function getLegalIssueCommands<S extends GameState>(
  gameState: S,
): LegalIssueCommands | null {
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
  const commands =
    phaseState.step === 'firstPlayerIssueCommands'
      ? phaseState.remainingCommandsFirstPlayer
      : phaseState.remainingCommandsSecondPlayer;

  if (commands.length === 0) {
    return null;
  }

  return { commands, player };
}
