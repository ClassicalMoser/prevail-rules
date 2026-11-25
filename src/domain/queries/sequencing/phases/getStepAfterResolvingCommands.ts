import type { GameState, IssueCommandsPhaseStep } from '@game';
import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

/**
 * The step after a player has carried out all their orders: the second
 * player issues theirs next, and after the second player's the phase is done
 * (§4.3).
 *
 * @param state - The game state, on a resolve step
 * @returns The step that follows
 * @throws Error when not on a resolve step
 */
export function getStepAfterResolvingCommands(
  state: GameState,
): IssueCommandsPhaseStep {
  const { step } = getIssueCommandsPhaseState(state);

  // Once the first player's orders are carried out, the second player issues.
  if (step === 'firstPlayerResolveCommands') {
    return 'secondPlayerIssueCommands';
  }

  // Once the second player's are carried out, the phase is over.
  if (step === 'secondPlayerResolveCommands') {
    return 'complete';
  }

  // On an issuing step, or once the phase is done, no orders are being carried out.
  throw new Error(`Not on a resolve commands step: ${step}`);
}
