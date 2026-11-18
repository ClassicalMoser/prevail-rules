import type { ResolveFlankEngagementEvent } from '@events';
import type { GameState } from '@game';
import { getMovementResolutionState } from '@queries';
import {
  addEngagingUnitToBoard,
  carryRidingCommander,
  completeEngagementInMovement,
  removeUnitFromBoard,
  updateBoardState,
  updateCommandResolutionState,
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
  const movementState = getMovementResolutionState(state);
  // The engagement opened from a move already written into the enemy.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );
  const { movingUnit } = movementState;
  const arrived = { placement: targetPlacement, unit: movingUnit.unit };

  // The attacker leaves the space it waited on and joins the defender, which
  // is dragged round to face it (§6.3.4). A commander riding with it arrives
  // too (§4.3.10).
  const lifted = removeUnitFromBoard(state.boardState, movingUnit);
  const engaged = carryRidingCommander(
    addEngagingUnitToBoard(lifted, arrived),
    movementState,
    targetPlacement.coordinate,
  );

  // The movement records where the mover now stands, and the engagement is
  // done: the defender has turned.
  const placed = updateCommandResolutionState(
    updateBoardState(state, engaged),
    { ...movementState, movingUnit: arrived },
  );
  const turned = completeEngagementInMovement(
    updateFlankEngagementResolutionState(placed, { defenderRotated: true }),
  );
  return turned;
}
