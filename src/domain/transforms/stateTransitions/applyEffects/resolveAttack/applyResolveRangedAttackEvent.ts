import type { Board } from '@entities';
import type { ResolveRangedAttackEventForBoard } from '@events';
import type {
  AttackApplyStateForBoard,
  AttackResult,
  GameStateForBoard,
  IssueCommandsPhaseStateForBoard,
  RangedAttackResolutionStateForBoard,
  RetreatStateForBoard,
  ReverseStateForBoard,
  RoutState,
} from '@game';
import {
  getIssueCommandsPhaseStateForBoard,
  getRangedAttackResolutionState,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveRangedAttackEvent to the game state.
 * Creates the AttackApplyState with nested substeps (rout/retreat/reverse) based on the attack results.
 *
 * @param event - The resolve ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply state created
 */
export function applyResolveRangedAttackEvent<TBoard extends Board>(
  event: ResolveRangedAttackEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseStateForBoard(state);
  const rangedAttackState = getRangedAttackResolutionState(state);

  const defendingUnit = event.defenderWithPlacement.unit;
  const unitWithPlacement = event.defenderWithPlacement;
  const { boardType } = state.boardState;

  const attackResult: AttackResult = {
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
    unitRouted: event.routed,
  };

  let routState: RoutState | undefined;
  let retreatState: RetreatStateForBoard<TBoard> | undefined;
  let reverseState: ReverseStateForBoard<TBoard> | undefined;

  if (attackResult.unitRouted) {
    routState = {
      cardsChosen: false,
      completed: false,
      numberToDiscard: undefined,
      player: defendingUnit.playerSide,
      substepType: 'rout',
      unitsToRout: [defendingUnit],
    };
  } else if (attackResult.unitRetreated) {
    const { legalRetreatOptions } = event;
    const finalPosition =
      legalRetreatOptions.length === 1
        ? [...legalRetreatOptions][0]
        : undefined;

    retreatState = {
      boardType,
      completed: false,
      finalPosition,
      legalRetreatOptions,
      retreatingUnit: unitWithPlacement,
      routState: undefined,
      substepType: 'retreat',
    };
  } else if (attackResult.unitReversed) {
    reverseState = {
      boardType,
      completed: false,
      finalPosition: undefined,
      reversingUnit: unitWithPlacement,
      substepType: 'reverse',
    };
  }

  const attackApplyState: AttackApplyStateForBoard<TBoard> = {
    attackResult,
    boardType,
    completed: false,
    defendingUnit,
    retreatState,
    reverseState,
    routState,
    substepType: 'attackApply' as const,
  };

  const newRangedAttackState: RangedAttackResolutionStateForBoard<TBoard> = {
    ...rangedAttackState,
    attackApplyState,
  };

  const newPhaseState: IssueCommandsPhaseStateForBoard<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  };

  return updatePhaseState(state, newPhaseState);
}
