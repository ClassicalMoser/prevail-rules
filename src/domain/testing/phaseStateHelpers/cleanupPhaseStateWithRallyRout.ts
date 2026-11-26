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
  return onRally;
}
