import type { Board, UnitPlacement } from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import type {
  AttackApplyState,
  AttackResult,
  GameStateForBoard,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
  RetreatState,
  ReverseState,
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
  event: ResolveRangedAttackEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseStateForBoard(state);
  const rangedAttackState = getRangedAttackResolutionState(state);

  const defendingUnit = event.defenderWithPlacement.unit;
  const unitWithPlacement = event.defenderWithPlacement;

  const attackResult: AttackResult = {
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
    unitRouted: event.routed,
  };

  let routState: RoutState | 'pending' = 'pending';
  let retreatState: RetreatState | 'pending' = 'pending';
  let reverseState: ReverseState | 'pending' = 'pending';

  if (attackResult.unitRouted) {
    routState = {
      cardsChosen: false,
      completed: false,
      numberToDiscard: 'pending',
      player: defendingUnit.playerSide,
      substepType: 'rout',
      unitsToRout: [defendingUnit],
    };
  } else if (attackResult.unitRetreated) {
    const { legalRetreatOptions } = event;
    const finalPosition: UnitPlacement | 'pending' =
      legalRetreatOptions.length === 1
        ? [...legalRetreatOptions][0]
        : 'pending';

    retreatState = {
      completed: false,
      finalPosition,
      legalRetreatOptions,
      retreatingUnit: unitWithPlacement,
      routState: 'pending',
      substepType: 'retreat',
    };
  } else if (attackResult.unitReversed) {
    reverseState = {
      completed: false,
      finalPosition: 'pending',
      reversingUnit: unitWithPlacement,
      substepType: 'reverse',
    };
  }

  const attackApplyState: AttackApplyState = {
    attackResult,
    completed: false,
    defendingUnit,
    retreatState,
    reverseState,
    routState,
    substepType: 'attackApply' as const,
  };

  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    attackApplyState,
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  };

  return updatePhaseState(state, newPhaseState);
}
