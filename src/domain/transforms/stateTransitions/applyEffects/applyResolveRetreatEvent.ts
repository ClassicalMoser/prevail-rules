import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  RangedAttackResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { ResolveRetreatEvent } from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  getRetreatStateFromRangedAttack,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRetreatEvent to the game state.
 * Moves the retreating unit from startingPosition to finalPosition on the board.
 * Marks the retreat state as completed.
 *
 * @param event - The resolve retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved and retreat state marked as completed
 */
export function applyResolveRetreatEvent<TBoard extends Board>(
  event: ResolveRetreatEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Move the unit on the board
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.startingPosition,
  );
  const addedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    event.finalPosition,
  );

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);
    const retreatState = getRetreatStateFromRangedAttack(state);

    // Mark retreat as completed
    const newRetreatState = {
      ...retreatState,
      completed: true,
    };

    // Update attack apply state
    const newAttackApplyState = {
      ...attackApplyState,
      retreatState: newRetreatState,
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
      boardState: addedUnitBoard,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Find which player's retreat state this is
    const firstPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.whiteAttackApplyState
        : meleeState.blackAttackApplyState;
    const secondPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.blackAttackApplyState
        : meleeState.whiteAttackApplyState;

    // Determine which player's retreat state matches the event
    const retreatingPlayer = event.startingPosition.unit.playerSide;
    const isFirstPlayerRetreat = retreatingPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerRetreat && firstPlayerAttackApply?.retreatState) {
      const retreatState = firstPlayerAttackApply.retreatState;
      const newRetreatState = {
        ...retreatState,
        completed: true,
      };
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        retreatState: newRetreatState,
      };
      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };
    } else if (!isFirstPlayerRetreat && secondPlayerAttackApply?.retreatState) {
      const retreatState = secondPlayerAttackApply.retreatState;
      const newRetreatState = {
        ...retreatState,
        completed: true,
      };
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        retreatState: newRetreatState,
      };
      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };
    } else {
      throw new Error('Could not find matching retreat state');
    }

    // Update phase state
    const newPhaseState: ResolveMeleePhaseState<TBoard> = {
      ...resolveMeleePhaseState,
      currentMeleeResolutionState: newMeleeState,
    };

    return {
      ...state,
      boardState: addedUnitBoard,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  throw new Error(
    `Retreat resolution not expected in phase: ${phaseState.phase}`,
  );
}
