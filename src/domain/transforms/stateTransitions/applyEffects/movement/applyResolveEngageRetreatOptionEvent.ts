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
 * Uses `getFrontEngagementStateFromMovement` (panicky narrowing) instead of a manual
 * front-type check.
 * TODO(misleading): this apply does not call `getFrontEngagementStateFromMovement`
 * itself; `updateFrontEngagementResolutionState` does, and throws outside a
 * front engagement. Settle by naming the transform that narrows.
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
  // The procedure also gives an empty list to a defender that is not
  // strictly the faster (§6.3.2 step 2); either way it is not offered the
  // choice, so it is recorded as standing, and no retreat will ever open.
  if (event.retreatPaths.length === 0) {
    const recorded = updateFrontEngagementResolutionState(state, {
      defendingUnitRetreats: false,
      retreatPaths: [],
      retreatState: 'bypassed',
    });

    // Nothing is left to settle before the melee, so the move can finish.
    const stands = completeEngagementInMovement(recorded);

    // The two units locked together, to fight in Phase 4 (§6.3.2 step 4).
    return stands;
  }

  // The defender may fall back. The retreats are recorded as the procedure
  // worked them out, for the defender's owner to decide whether to take one
  // (§6.3.2 step 3); the engagement stays open until then.
  const mayRetreat = updateFrontEngagementResolutionState(state, {
    retreatPaths: event.retreatPaths,
  });

  // The engagement, waiting on the defender's decision.
  return mayRetreat;
}
