import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';
import {
  getIssueCommandsPhaseState,
  getOtherPlayer,
  getRemainingCommandsForPlayer,
} from '@queries';

/**
 * Atomic issue-command context: which player may issue, and which remaining
 * commands they may still spend.
 *
 * Eligible units/lines for a chosen command are enumerated separately via
 * {@link getLegalUnitsToOrder} (the units of a units order) and
 * {@link getLegalLines} (every line a lines order may take).
 *
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
 *
 * The expected engine asks for an order only on an issuing step with orders
 * left, so being asked anywhere else is the caller's mistake and throws.
 *
 * @throws Error outside the issue commands phase, off an issuing step, or
 * when the issuing player has no orders left
 */
export function getLegalIssueCommands<S extends GameState>(
  gameState: S,
): LegalIssueCommands {
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
  const commands = getRemainingCommandsForPlayer(gameState, player);

  // With every order issued the step should already have moved on to
  // resolving them.
  if (commands.length === 0) {
    throw new Error(`${player} has no orders left to issue`);
  }

  const legal: LegalIssueCommands = { commands, player };
  return legal;
}
