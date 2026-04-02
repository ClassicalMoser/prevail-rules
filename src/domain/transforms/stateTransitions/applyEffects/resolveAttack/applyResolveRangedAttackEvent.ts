import type { Board } from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import type {
  AttackApplyState,
  AttackResult,
  GameStateWithBoard,
  IssueCommandsPhaseState,
  PhaseState,
  RangedAttackResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
} from '@game';
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
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const rangedAttackState = getRangedAttackResolutionState(state);

  const defendingUnit = event.defenderWithPlacement.unit;
  const unitWithPlacement = event.defenderWithPlacement;
  const boardType = state.boardState.boardType;

  const attackResult: AttackResult = {
    unitRouted: event.routed,
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
  };

  let routState: RoutState | undefined;
  let retreatState: RetreatState | undefined;
  let reverseState: ReverseState | undefined;

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
      boardType,
      retreatingUnit: unitWithPlacement,
      legalRetreatOptions,
      finalPosition,
      routState: undefined,
      completed: false,
    } as RetreatState;
  } else if (attackResult.unitReversed) {
    reverseState = {
      substepType: 'reverse',
      boardType,
      reversingUnit: unitWithPlacement,
      finalPosition: undefined,
      completed: false,
    } as ReverseState;
  }

  const attackApplyState = {
    substepType: 'attackApply' as const,
    boardType,
    defendingUnit,
    attackResult,
    routState,
    retreatState,
    reverseState,
    completed: false,
  } as AttackApplyState;

  const newRangedAttackState = {
    ...rangedAttackState,
    attackApplyState,
  } as RangedAttackResolutionState;

  const newPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  } as IssueCommandsPhaseState;

  return updatePhaseState(state, newPhaseState as PhaseState);
}
