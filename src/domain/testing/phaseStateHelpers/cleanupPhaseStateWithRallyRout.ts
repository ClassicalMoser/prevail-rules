import type { CleanupPhaseState, GameState, RoutState } from '@game';
import { hasInitiative } from '@queries';
import { createCleanupPhaseState } from './cleanupPhaseState';
import { createRallyResolutionState } from './rallyResolutionState';

/**
 * Cleanup on the routing player's own rally, with that rally accepted and the
 * given rout open on it. The player holding the initiative rallies first, the
 * other second, so the rally goes in that player's slot and the step is that
 * player's resolve step.
 *
 * @param state - The game state, read for who holds the initiative
 * @param routState - The rout the rallying player owes
 * @returns Cleanup on that player's resolve-rally step
 */
export function createCleanupPhaseStateWithRallyRout(
  state: GameState,
  routState: RoutState,
): CleanupPhaseState {
  // The player chose to rally and the rally has been carried out: cards
  // burnt and taken back, support assigned, and the uncovered units routing
  // (§10.3.2, §10.4.6). What they owe is the rout given.
  const rally = createRallyResolutionState({
    playerRallied: true,
    rallyResolved: true,
    routState,
  });

  // The first player rallies first (§4.5.2), the other after.
  const onRally = hasInitiative(state, routState.player)
    ? createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      })
    : createCleanupPhaseState({
        secondPlayerRallyResolutionState: rally,
        step: 'secondPlayerResolveRally',
      });

  // Cleanup on that player's rally, the other player's slot untouched.
  return onRally;
}
