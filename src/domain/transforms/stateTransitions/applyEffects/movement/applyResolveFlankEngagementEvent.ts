import type { ResolveFlankEngagementEvent } from '@events';
import type { GameState } from '@game';
import { getMovementResolutionState } from '@queries';
import {
  carryRidingCommander,
  completeEngagementInMovement,
  moveUnitIntoEngagement,
  updateFlankEngagementResolutionState,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Applies a ResolveFlankEngagementEvent: the attacker is set down in the
 * defender's space, and the defender is turned to face it (§6.3.4). It may
 * not retreat, so nothing waits on it; the two fight in Phase 4.
 *
 * The attacker waited on its start space while the engagement opened. Where
 * its move ends is the movement's record, and the defender is the one unit in
 * that space, so the event carries nothing. Set down as the first of the pair,
 * the attacker keeps its facing and the defender faces opposite it, which is
 * the turn the rule requires.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state, in a flank engagement
 * @returns A new game state with the two engaged and the engagement complete
 */
export function applyResolveFlankEngagementEvent<S extends GameState>(
  _event: ResolveFlankEngagementEvent,
  state: S,
): S {
  // The move whose unit walked into the defender's flank.
  const movementState = getMovementResolutionState(state);

  // The engagement opened from a move already written into the enemy.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );

  // The attacker leaves the space it waited on and joins the defender, which
  // is dragged round to face it (§6.3.4). A commander riding with it arrives
  // too (§4.3.10).
  const joined = moveUnitIntoEngagement(
    state,
    movementState.movingUnit,
    targetPlacement,
  );
  const engaged = carryRidingCommander(
    joined,
    movementState,
    targetPlacement.coordinate,
  );

  // The engagement is done: the defender has turned.
  // It may not retreat, and nothing else waits on it (§6.3.4), so the
  // engagement closes in the same write and the move can finish.
  const rotated = updateFlankEngagementResolutionState(engaged, {
    defenderRotated: true,
  });
  const turned = completeEngagementInMovement(rotated);

  // The two engaged in the defender's space, to fight in Phase 4.
  return turned;
}
