import type { Board, UnitPlacement, UnitWithPlacement } from '@entities';
import type { ResolveMeleeEventForBoard } from '@events';
import type {
  AttackApplyStateForBoard,
  AttackResult,
  GameStateForBoard,
  RetreatStateForBoard,
  ReverseStateForBoard,
  RoutState,
} from '@game';
import {
  getMeleeResolutionState,
  getResolveMeleePhaseStateForBoard,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

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
  const { boardType } = meleeState;

  const whiteAttackResult: AttackResult = {
    unitRetreated: event.whiteUnitRetreated,
    unitReversed: event.whiteUnitReversed,
    unitRouted: event.whiteUnitRouted,
  };

  const blackAttackResult: AttackResult = {
    unitRetreated: event.blackUnitRetreated,
    unitReversed: event.blackUnitReversed,
    unitRouted: event.blackUnitRouted,
  };

  const createAttackApplyState = (
    unitWithPlacement: UnitWithPlacement<TBoard>,
    attackResult: AttackResult,
    legalRetreatOptionsFromEvent: Set<UnitPlacement<TBoard>>,
  ): AttackApplyStateForBoard<TBoard> | undefined => {
    if (
      !attackResult.unitRouted &&
      !attackResult.unitRetreated &&
      !attackResult.unitReversed
    ) {
      return undefined;
    }

    let routState: RoutState | undefined;
    let retreatState: RetreatStateForBoard<TBoard> | undefined;
    let reverseState: ReverseStateForBoard<TBoard> | undefined;

    if (attackResult.unitRouted) {
      routState = {
        cardsChosen: false,
        completed: false,
        numberToDiscard: undefined,
        player: unitWithPlacement.unit.playerSide,
        substepType: 'rout',
        unitsToRout: new Set([unitWithPlacement.unit]),
      };
    } else if (attackResult.unitRetreated) {
      const legalRetreatOptions = legalRetreatOptionsFromEvent;
      const finalPosition =
        legalRetreatOptions.size === 1
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
    } else {
      // Invariant: at least one of rout/retreat/reverse is true (see guard above), and
      // We are not in rout or retreat, so this must be reverse.
      reverseState = {
        boardType,
        completed: false,
        finalPosition: undefined,
        reversingUnit: unitWithPlacement,
        substepType: 'reverse',
      };
    }

    return {
      attackResult,
      boardType,
      completed: false,
      defendingUnit: unitWithPlacement.unit,
      retreatState,
      reverseState,
      routState,
      substepType: 'attackApply',
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
    blackAttackApplyState,
    whiteAttackApplyState,
  };

  const newPhaseState = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
