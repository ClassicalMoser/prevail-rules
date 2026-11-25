import type { GameState, IssueCommandsPhaseStep } from '@game';
import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

/**
 * The step a player moves to once they have finished issuing orders: they
 * carry their own orders out before the other player issues any (§4.3).
 *
 * @param state - The game state, on an issuing step
 * @returns That player's resolve step
 * @throws Error when not on an issuing step
 */
export function getResolveStepAfterIssuing(
  state: GameState,
): IssueCommandsPhaseStep {
  const { step } = getIssueCommandsPhaseState(state);

  // The first player carries out their orders once they have issued them.
  if (step === 'firstPlayerIssueCommands') {
    return 'firstPlayerResolveCommands';
  }

  // So does the second.
  if (step === 'secondPlayerIssueCommands') {
    return 'secondPlayerResolveCommands';
  }

  // On a resolve step, or once the phase is done, no one is issuing.
  throw new Error(`Not on an issuing step: ${step}`);
}
