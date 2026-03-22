import type {
  AttackApplyState,
  AttackResult,
  Board,
  GameState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
  RetreatState,
  ReverseState,
  RoutState,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { ResolveMeleeEvent } from '@events';
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
  ): AttackApplyState<TBoard> | undefined => {
    if (
      !attackResult.unitRouted &&
      !attackResult.unitRetreated &&
      !attackResult.unitReversed
    ) {
      return undefined;
    }

    let routState: RoutState | undefined;
    let retreatState: RetreatState<TBoard> | undefined;
    let reverseState: ReverseState<TBoard> | undefined;

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

    return {
      substepType: 'attackApply',
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

  const newMeleeState: MeleeResolutionState<TBoard> = {
    ...meleeState,
    whiteAttackApplyState,
    blackAttackApplyState,
  };

  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
