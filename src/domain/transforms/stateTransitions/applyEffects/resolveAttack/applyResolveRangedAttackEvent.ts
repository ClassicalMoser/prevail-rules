import type { Board } from "@entities";
import type { ResolveRangedAttackEventForBoard } from "@events";
import type {
  AttackApplyStateForBoard,
  AttackResult,
  GameStateForBoard,
  IssueCommandsPhaseStateForBoard,
  RangedAttackResolutionStateForBoard,
  RetreatStateForBoard,
  ReverseStateForBoard,
  RoutState,
} from "@game";
import { getIssueCommandsPhaseStateForBoard, getRangedAttackResolutionState } from "@queries";
import { updatePhaseState } from "@transforms/pureTransforms";

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
  const boardType = state.boardState.boardType;

  const attackResult: AttackResult = {
    unitRouted: event.routed,
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
  };

  let routState: RoutState | undefined;
  let retreatState: RetreatStateForBoard<TBoard> | undefined;
  let reverseState: ReverseStateForBoard<TBoard> | undefined;

  if (attackResult.unitRouted) {
    routState = {
      substepType: "rout",
      player: defendingUnit.playerSide,
      unitsToRout: new Set([defendingUnit]),
      numberToDiscard: undefined,
      cardsChosen: false,
      completed: false,
    };
  } else if (attackResult.unitRetreated) {
    const legalRetreatOptions = event.legalRetreatOptions;
    const finalPosition = legalRetreatOptions.size === 1 ? [...legalRetreatOptions][0] : undefined;

    retreatState = {
      substepType: "retreat",
      boardType,
      retreatingUnit: unitWithPlacement,
      legalRetreatOptions,
      finalPosition,
      routState: undefined,
      completed: false,
    };
  } else if (attackResult.unitReversed) {
    reverseState = {
      substepType: "reverse",
      boardType,
      reversingUnit: unitWithPlacement,
      finalPosition: undefined,
      completed: false,
    };
  }

  const attackApplyState: AttackApplyStateForBoard<TBoard> = {
    substepType: "attackApply" as const,
    boardType,
    defendingUnit,
    attackResult,
    routState,
    retreatState,
    reverseState,
    completed: false,
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
