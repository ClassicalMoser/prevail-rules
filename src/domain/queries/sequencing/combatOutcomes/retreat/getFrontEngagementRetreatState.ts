import type { GameState, RetreatState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries/engagement';
import { throwIfBypassed, throwIfPending } from '@utils';

// TODO(composition): no production caller; `findRetreatLocation` reaches this
// slot for every reader. Settled by deleting it or naming the caller it waits for.
/**
 * Gets the retreat state nested under a front engagement in movement CRS.
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if not in a front engagement, or when the defender has not
 * fallen back
 */
export function getFrontEngagementRetreatState(state: GameState): RetreatState {
  const engagementState = getFrontEngagementStateFromMovement(state);
  // `'pending'` means the defender has not yet chosen whether to give ground
  // (§6.3.2); `'bypassed'` means it stood, or had nowhere to fall back to.
  // Neither leaves a retreat to hand back.
  const retreatState = throwIfBypassed(
    throwIfPending(
      engagementState.engagementResolutionState.retreatState,
      'No retreat state found in front engagement',
    ),
    'The defender stood; no retreat in front engagement',
  );
  // The retreat of the defender that gave ground.
  return retreatState;
}
