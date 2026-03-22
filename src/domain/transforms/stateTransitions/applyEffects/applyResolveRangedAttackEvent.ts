import type {
  AttackApplyState,
  AttackResult,
  Board,
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
} from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import {
  getIssueCommandsPhaseState,
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
  event: ResolveRangedAttackEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const rangedAttackState = getRangedAttackResolutionState(state);

  const defendingUnit = event.defenderWithPlacement.unit;
  const unitWithPlacement = event.defenderWithPlacement;

  const attackResult: AttackResult = {
    unitRouted: event.routed,
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
  };

  let routState: RoutState | undefined;
  let retreatState: RetreatState<TBoard> | undefined;
  let reverseState: ReverseState<TBoard> | undefined;

  if (attackResult.unitRouted) {
    routState = {
      substepType: 'rout',
      player: defendingUnit.playerSide,
      unitsToRout: new Set([defendingUnit]),
      numberToDiscard: undefined,
      cardsChosen: false,
      completed: false,
    };
  } else if (attackResult.unitRetreated) {
    const legalRetreatOptions = event.legalRetreatOptions;
    const finalPosition =
      legalRetreatOptions.size === 1 ? [...legalRetreatOptions][0] : undefined;

    retreatState = {
      substepType: 'retreat',
      retreatingUnit: unitWithPlacement,
      legalRetreatOptions,
      finalPosition,
      routState: undefined,
      completed: false,
    };
  } else if (attackResult.unitReversed) {
    reverseState = {
      substepType: 'reverse',
      reversingUnit: unitWithPlacement,
      finalPosition: undefined,
      completed: false,
    };
  }

  const attackApplyState: AttackApplyState<TBoard> = {
    substepType: 'attackApply',
    defendingUnit,
    attackResult,
    routState,
    retreatState,
    reverseState,
    completed: false,
  };

  const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
    ...rangedAttackState,
    attackApplyState,
  };

  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  };

  return updatePhaseState(state, newPhaseState);
}
