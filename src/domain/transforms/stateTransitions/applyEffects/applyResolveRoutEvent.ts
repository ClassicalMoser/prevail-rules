import type {
  Board,
  CleanupPhaseState,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  RallyResolutionState,
  RangedAttackResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { ResolveRoutEvent } from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCleanupPhaseState,
  getCurrentRallyResolutionState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getResolveMeleePhaseState,
  getRoutStateFromRally,
} from '@queries';

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

  // Rout can occur in multiple contexts: engagement, attack apply, or rally resolution
  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const commandResolutionState =
      issueCommandsPhaseState.currentCommandResolutionState;

    if (!commandResolutionState) {
      throw new Error('No current command resolution state');
    }

    // Check if it's a ranged attack with rout state
    if (commandResolutionState.commandResolutionType === 'rangedAttack') {
      const rangedAttackState = commandResolutionState;
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);

      if (!attackApplyState.routState) {
        throw new Error('No rout state found in ranged attack');
      }

      // Set the number to discard
      const newRoutState = {
        ...attackApplyState.routState,
        numberToDiscard: event.penalty,
      };

      // Update attack apply state
      const newAttackApplyState = {
        ...attackApplyState,
        routState: newRoutState,
      };

      // Update ranged attack resolution state
      const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
        ...rangedAttackState,
        attackApplyState: newAttackApplyState,
      };

      // Update phase state
      const newPhaseState: IssueCommandsPhaseState<TBoard> = {
        ...issueCommandsPhaseState,
        currentCommandResolutionState: newRangedAttackState,
      };

      return {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: newPhaseState,
        },
      };
    }

    // Check if it's a movement with engagement rout state
    if (commandResolutionState.commandResolutionType === 'movement') {
      // TODO: Handle engagement rout state
      throw new Error('Engagement rout state handling not yet implemented');
    }
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Determine which player's rout state this is
    const routedUnits = Array.from(event.unitInstances);
    if (routedUnits.length === 0) {
      throw new Error('No units to rout');
    }
    const routedPlayer = routedUnits[0].playerSide;
    const isFirstPlayerRout = routedPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerRout) {
      const attackApplyState = getAttackApplyStateFromMelee(state, firstPlayer);
      if (!attackApplyState.routState) {
        throw new Error('No rout state found for first player');
      }

      const newRoutState = {
        ...attackApplyState.routState,
        numberToDiscard: event.penalty,
      };

      const newAttackApplyState = {
        ...attackApplyState,
        routState: newRoutState,
      };

      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };
    } else {
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const attackApplyState = getAttackApplyStateFromMelee(
        state,
        secondPlayer,
      );
      if (!attackApplyState.routState) {
        throw new Error('No rout state found for second player');
      }

      const newRoutState = {
        ...attackApplyState.routState,
        numberToDiscard: event.penalty,
      };

      const newAttackApplyState = {
        ...attackApplyState,
        routState: newRoutState,
      };

      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };
    }

    // Update phase state
    const newPhaseState: ResolveMeleePhaseState<TBoard> = {
      ...resolveMeleePhaseState,
      currentMeleeResolutionState: newMeleeState,
    };

    return {
      ...state,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  // Handle rally resolution (in cleanup phase)
  if (phaseState.phase === 'cleanup') {
    const cleanupPhaseState = getCleanupPhaseState(state);
    const rallyState = getCurrentRallyResolutionState(state);
    const routState = getRoutStateFromRally(rallyState);

    // Set the number to discard
    const newRoutState = {
      ...routState,
      numberToDiscard: event.penalty,
    };

    // Update rally state
    const newRallyState: RallyResolutionState = {
      ...rallyState,
      routState: newRoutState,
    };

    // Update phase state
    const isFirstPlayerStep =
      cleanupPhaseState.step === 'firstPlayerResolveRally';
    const newPhaseState: CleanupPhaseState = isFirstPlayerStep
      ? {
          ...cleanupPhaseState,
          firstPlayerRallyResolutionState: newRallyState,
        }
      : {
          ...cleanupPhaseState,
          secondPlayerRallyResolutionState: newRallyState,
        };

    return {
      ...state,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  throw new Error(`Rout resolution not expected in phase: ${phaseState.phase}`);
}
