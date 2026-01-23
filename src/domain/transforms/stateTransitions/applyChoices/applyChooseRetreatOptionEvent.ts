import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  RangedAttackResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { ChooseRetreatOptionEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  getRetreatStateFromRangedAttack,
} from '@queries';

/**
 * Applies a ChooseRetreatOptionEvent to the game state.
 * Updates the finalPosition in the retreat state.
 *
 * Retreat state can be found in:
 * - AttackApplyState (in ranged attack resolution or melee resolution)
 * - EngagementState (in movement resolution, for front engagements) - TODO: Not yet implemented
 *
 * @param event - The choose retreat option event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat option chosen
 */
export function applyChooseRetreatOptionEvent<TBoard extends Board>(
  event: ChooseRetreatOptionEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  const player = event.player;
  const chosenRetreatOption = event.retreatOption;

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const rangedAttackState = getRangedAttackResolutionState(state);
    const retreatState = getRetreatStateFromRangedAttack(state);

    // Update retreat state with chosen final position
    const newRetreatState = {
      ...retreatState,
      finalPosition: chosenRetreatOption,
    };

    // Update attack apply state
    const newAttackApplyState = {
      ...rangedAttackState.attackApplyState!,
      retreatState: newRetreatState,
    };

    // Update ranged attack resolution state
    const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
      ...rangedAttackState,
      attackApplyState: newAttackApplyState,
    };

    // Update phase state
    const phaseState = getIssueCommandsPhaseState(state);
    const newPhaseState: IssueCommandsPhaseState<TBoard> = {
      ...phaseState,
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

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Find which player's attack apply state has the retreat state
    const firstPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.whiteAttackApplyState
        : meleeState.blackAttackApplyState;
    const secondPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.blackAttackApplyState
        : meleeState.whiteAttackApplyState;

    // Check first player's attack apply state
    if (
      firstPlayerAttackApply?.retreatState &&
      firstPlayerAttackApply.retreatState.retreatingUnit.unit.playerSide ===
        player
    ) {
      const retreatState = firstPlayerAttackApply.retreatState;

      // Update retreat state
      const newRetreatState = {
        ...retreatState,
        finalPosition: chosenRetreatOption,
      };

      // Update attack apply state
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        retreatState: newRetreatState,
      };

      // Update melee resolution state
      const newMeleeState: MeleeResolutionState<TBoard> = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };

      // Update phase state
      const phaseState = getResolveMeleePhaseState(state);
      const newPhaseState: ResolveMeleePhaseState<TBoard> = {
        ...phaseState,
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

    // Check second player's attack apply state
    if (
      secondPlayerAttackApply?.retreatState &&
      secondPlayerAttackApply.retreatState.retreatingUnit.unit.playerSide ===
        player
    ) {
      const retreatState = secondPlayerAttackApply.retreatState;

      // Update retreat state
      const newRetreatState = {
        ...retreatState,
        finalPosition: chosenRetreatOption,
      };

      // Update attack apply state
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        retreatState: newRetreatState,
      };

      // Update melee resolution state
      const newMeleeState: MeleeResolutionState<TBoard> = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };

      // Update phase state
      const phaseState = getResolveMeleePhaseState(state);
      const newPhaseState: ResolveMeleePhaseState<TBoard> = {
        ...phaseState,
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

    throw new Error('No retreat state found for player in melee resolution');
  }

  throw new Error(
    `Retreat option choice not expected in phase: ${phaseState.phase}`,
  );
}
