import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  completeEngagementInMovement,
  updateFrontEngagementResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveEngageRetreatOptionEvent to the game state.
 * Updates the defendingUnitCanRetreat flag in the front engagement resolution state.
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
  // (§9.1.5). With nowhere to go the engagement ends here, and the two units
  // stand engaged for the melee in Phase 4.
  if (!event.defendingUnitCanRetreat) {
    const stands = completeEngagementInMovement(
      updateFrontEngagementResolutionState(state, {
        defendingUnitCanRetreat: false,
        defendingUnitRetreats: false,
      }),
    );
    return stands;
  }

  const mayRetreat = updateFrontEngagementResolutionState(state, {
    defendingUnitCanRetreat: true,
  });
  return mayRetreat;
}
