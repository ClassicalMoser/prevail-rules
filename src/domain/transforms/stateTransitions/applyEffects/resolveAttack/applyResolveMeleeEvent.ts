import type { Board, UnitPlacement, UnitWithPlacement } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import type {
  AttackApplyState,
  AttackResult,
  GameState,
  MeleeResolutionState,
  PhaseState,
  ResolveMeleePhaseState,
  RetreatState,
  ReverseState,
  RoutState,
} from '@game';
import { getMeleeResolutionState, getResolveMeleePhaseState } from '@queries';
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
  event: ResolveMeleeEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getResolveMeleePhaseState(state);
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
  ): AttackApplyState | undefined => {
    if (
      !attackResult.unitRouted &&
      !attackResult.unitRetreated &&
      !attackResult.unitReversed
    ) {
      return undefined;
    }

    let routState: RoutState | undefined;
    let retreatState: RetreatState | undefined;
    let reverseState: ReverseState | undefined;

    if (attackResult.unitRouted) {
      routState = {
        substepType: 'rout',
        player: unitWithPlacement.unit.playerSide,
        unitsToRout: new Set([unitWithPlacement.unit]),
        numberToDiscard: undefined,
        cardsChosen: false,
        completed: false,
      };
    } else if (attackResult.unitRetreated) {
      const legalRetreatOptions = legalRetreatOptionsFromEvent;
      const finalPosition =
        legalRetreatOptions.size === 1
          ? [...legalRetreatOptions][0]
          : undefined;

      retreatState = {
        substepType: 'retreat',
        boardType,
        retreatingUnit: unitWithPlacement,
        legalRetreatOptions,
        finalPosition,
        routState: undefined,
        completed: false,
      } as RetreatState;
    } else {
      // Invariant: at least one of rout/retreat/reverse is true (see guard above), and
      // we are not in rout or retreat, so this must be reverse.
      reverseState = {
        substepType: 'reverse',
        boardType,
        reversingUnit: unitWithPlacement,
        finalPosition: undefined,
        completed: false,
      } as ReverseState;
    }

    return {
      substepType: 'attackApply',
      boardType,
      defendingUnit: unitWithPlacement.unit,
      attackResult,
      routState,
      retreatState,
      reverseState,
      completed: false,
    } as AttackApplyState;
  };

  const whiteAttackApplyState = createAttackApplyState(
    event.whiteUnitWithPlacement as UnitWithPlacement<TBoard>,
    whiteAttackResult,
    event.whiteLegalRetreatOptions as Set<UnitPlacement<TBoard>>,
  );
  const blackAttackApplyState = createAttackApplyState(
    event.blackUnitWithPlacement as UnitWithPlacement<TBoard>,
    blackAttackResult,
    event.blackLegalRetreatOptions as Set<UnitPlacement<TBoard>>,
  );

  const newMeleeState = {
    ...meleeState,
    whiteAttackApplyState,
    blackAttackApplyState,
  } as MeleeResolutionState;

  const newPhaseState = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  } as ResolveMeleePhaseState;

  return updatePhaseState(state, newPhaseState as PhaseState<TBoard>);
}
