import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  completeEngagementInMovement,
  updateFrontEngagementResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveEngageRetreatOptionEvent to the game state: the retreats
 * the defender may make are recorded in the front engagement. With none, the
 * defender stands and the engagement ends here.
 * Uses {@link getFrontEngagementStateFromMovement} (panicky narrowing) instead of a manual
 * front-type check.
 *
 * @param event - The resolve engage retreat option event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat option resolved
 */
export function applyResolveEngageRetreatOptionEvent<S extends GameState>(
  event: ResolveEngageRetreatOptionEvent,
  state: S,
): S {
  // The defender may fall back only where there is somewhere to fall back to
  // (§6.3.2, §9.1.5). With nowhere to go the engagement ends here, and the two units
  // stand engaged for the melee in Phase 4.
  if (event.retreatPaths.length === 0) {
    const stands = completeEngagementInMovement(
      updateFrontEngagementResolutionState(state, {
        defendingUnitRetreats: false,
        retreatPaths: [],
      }),
    );
    return stands;
  }

  const mayRetreat = updateFrontEngagementResolutionState(state, {
    retreatPaths: event.retreatPaths,
  });
  return mayRetreat;
}
