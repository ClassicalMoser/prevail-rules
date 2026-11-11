import type { CommandResolutionState, GameState } from '@game';

/**
 * The command resolution in progress, or `undefined` when none is. A caller
 * that is asking whether an order is being carried out, and is not told one
 * is, uses this; `getCurrentCommandResolutionState` is the twin that insists.
 *
 * No order is being carried out outside Phase 3, or in it before the first
 * unit of an order has been named. Neither is a fault, just the answer.
 *
 * @param state - The game state
 * @returns The command resolution in progress, or `undefined`
 */
export function findCurrentCommandResolutionState(
  state: GameState,
): CommandResolutionState | undefined {
  const phaseState = state.currentRoundState.currentPhaseState;
  // An order is carried out only in Phase 3.
  if (phaseState === 'none' || phaseState.phase !== 'issueCommands') {
    return undefined;
  }
  // `'pending'` means no unit of the order has been named yet.
  const resolution = phaseState.currentCommandResolutionState;
  if (resolution === 'pending') {
    return undefined;
  }
  return resolution;
}
