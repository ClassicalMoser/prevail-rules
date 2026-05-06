import type { Board, UnitPlacement, UnitWithPlacement } from "@entities";
import type { ResolveMeleeEventForBoard } from "@events";
import type {
  AttackApplyStateForBoard,
  AttackResult,
  GameStateForBoard,
  RetreatStateForBoard,
  ReverseStateForBoard,
  RoutState,
} from "@game";
import { getMeleeResolutionState, getResolveMeleePhaseStateForBoard } from "@queries";
import { updatePhaseState } from "@transforms/pureTransforms";

/**
 * Applies a ResolveMeleeEvent to the game state.
 * Creates AttackApplyStates for both players with nested substeps (rout/retreat/reverse) based on the attack results.
 *
 * @param event - The resolve melee event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply states created for both players
 */
export function applyResolveMeleeEvent<TBoard extends Board>(
  event: ResolveMeleeEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getResolveMeleePhaseStateForBoard(state);
  const meleeState = getMeleeResolutionState(state);
  const boardType = meleeState.boardType;

  const whiteAttackResult: AttackResult = {
    unitRouted: event.whiteUnitRouted,
    unitRetreated: event.whiteUnitRetreated,
    unitReversed: event.whiteUnitReversed,
  };

  const blackAttackResult: AttackResult = {
    unitRouted: event.blackUnitRouted,
    unitRetreated: event.blackUnitRetreated,
    unitReversed: event.blackUnitReversed,
  };

  const createAttackApplyState = (
    unitWithPlacement: UnitWithPlacement<TBoard>,
    attackResult: AttackResult,
    legalRetreatOptionsFromEvent: Set<UnitPlacement<TBoard>>,
  ): AttackApplyStateForBoard<TBoard> | undefined => {
    if (!attackResult.unitRouted && !attackResult.unitRetreated && !attackResult.unitReversed) {
      return undefined;
    }

    let routState: RoutState | undefined;
    let retreatState: RetreatStateForBoard<TBoard> | undefined;
    let reverseState: ReverseStateForBoard<TBoard> | undefined;

    if (attackResult.unitRouted) {
      routState = {
        substepType: "rout",
        player: unitWithPlacement.unit.playerSide,
        unitsToRout: new Set([unitWithPlacement.unit]),
        numberToDiscard: undefined,
        cardsChosen: false,
        completed: false,
      };
    } else if (attackResult.unitRetreated) {
      const legalRetreatOptions = legalRetreatOptionsFromEvent;
      const finalPosition =
        legalRetreatOptions.size === 1 ? [...legalRetreatOptions][0] : undefined;

      retreatState = {
        substepType: "retreat",
        boardType,
        retreatingUnit: unitWithPlacement,
        legalRetreatOptions,
        finalPosition,
        routState: undefined,
        completed: false,
      };
    } else {
      // Invariant: at least one of rout/retreat/reverse is true (see guard above), and
      // we are not in rout or retreat, so this must be reverse.
      reverseState = {
        substepType: "reverse",
        boardType,
        reversingUnit: unitWithPlacement,
        finalPosition: undefined,
        completed: false,
      };
    }

    return {
      substepType: "attackApply",
      boardType,
      defendingUnit: unitWithPlacement.unit,
      attackResult,
      routState,
      retreatState,
      reverseState,
      completed: false,
    };
  };

  const whiteAttackApplyState = createAttackApplyState(
    event.whiteUnitWithPlacement,
    whiteAttackResult,
    event.whiteLegalRetreatOptions,
  );
  const blackAttackApplyState = createAttackApplyState(
    event.blackUnitWithPlacement,
    blackAttackResult,
    event.blackLegalRetreatOptions,
  );

  const newMeleeState = {
    ...meleeState,
    whiteAttackApplyState,
    blackAttackApplyState,
  };

  const newPhaseState = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
