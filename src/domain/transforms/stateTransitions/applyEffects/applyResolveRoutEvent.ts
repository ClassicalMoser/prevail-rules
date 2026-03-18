import type { Board, GameState, RoutState } from '@entities';
import type { ResolveRoutEvent } from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentRallyResolutionState,
  getRoutStateFromRally,
} from '@queries';
import { updateRoutState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveRoutEvent to the game state.
 * Sets the numberToDiscard on the rout state based on the penalty.
 * The penalty is the sum of all routed units' rout penalties.
 *
 * @param event - The resolve rout event to apply
 * @param state - The current game state
 * @returns A new game state with the rout penalty set
 */
export function applyResolveRoutEvent<TBoard extends Board>(
  event: ResolveRoutEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Rout can occur in multiple contexts: attack apply (ranged/melee) or rally resolution
  // Handle attack apply contexts (ranged attack or melee resolution)
  if (
    phaseState.phase === 'issueCommands' ||
    phaseState.phase === 'resolveMelee'
  ) {
    // Get the current rout state from attack apply
    const routedUnits = [...event.unitInstances];
    if (routedUnits.length === 0) {
      throw new Error('No units to rout');
    }
    const routedPlayer = routedUnits[0].playerSide;

    // Get the attack apply state to find the rout state
    const attackApplyState =
      phaseState.phase === 'issueCommands'
        ? getAttackApplyStateFromRangedAttack(state)
        : getAttackApplyStateFromMelee(state, routedPlayer);

    if (!attackApplyState.routState) {
      throw new Error('No rout state found in attack apply state');
    }

    // Update rout state with penalty
    const newRoutState: RoutState = {
      ...attackApplyState.routState,
      numberToDiscard: event.penalty,
    };

    // Use updateRoutState for attack apply contexts
    return updateRoutState(state, newRoutState);
  }

  // Handle rally resolution (cleanup phase: routs from lost support)
  if (phaseState.phase === 'cleanup') {
    const rallyState = getCurrentRallyResolutionState(state);
    const currentRoutState = getRoutStateFromRally(rallyState);
    const newRoutState: RoutState = {
      ...currentRoutState,
      numberToDiscard: event.penalty,
    };
    return updateRoutState(state, newRoutState);
  }

  throw new Error(`Rout resolution not expected in phase: ${phaseState.phase}`);
}
