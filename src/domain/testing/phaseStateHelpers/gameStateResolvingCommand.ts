import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { updatePhaseState } from '@transforms';
import { createIssueCommandsPhaseState } from './issueCommandsPhaseState';

/**
 * A game in Phase 3, the first player carrying out the order a spec built:
 * a move or a shot, or none chosen yet (`'pending'`). For a spec about what
 * that order holds, so the phase around it is the usual one.
 *
 * @param resolution - The order being carried out
 * @param base - The game to put it in; an empty standard game unless the spec
 * needs a board or cards of its own
 * @returns That game, carrying out the order
 */
export function createGameStateResolvingCommand(
  resolution: CommandResolutionState | 'pending',
  base: GameState = createEmptyGameState('standard'),
): GameState {
  // Phase 3 on the first player's resolve step, with this order under way.
  const phase = createIssueCommandsPhaseState(base, {
    currentCommandResolutionState: resolution,
  });
  const resolving = updatePhaseState(base, phase);

  // The game, the first player carrying out that order.
  return resolving;
}
