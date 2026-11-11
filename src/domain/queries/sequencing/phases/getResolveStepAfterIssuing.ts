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
  if (step === 'firstPlayerIssueCommands') {
    return 'firstPlayerResolveCommands';
  }
  if (step === 'secondPlayerIssueCommands') {
    return 'secondPlayerResolveCommands';
  }
  throw new Error(`Not on an issuing step: ${step}`);
}
