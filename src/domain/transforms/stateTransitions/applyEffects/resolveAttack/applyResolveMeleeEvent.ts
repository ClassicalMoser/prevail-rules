import type { UnitPlacement, UnitWithPlacement } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import type {
  AttackApplyState,
  AttackResult,
  GameState,
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
export function applyResolveMeleeEvent(
  event: ResolveMeleeEvent,
  state: GameState,
): GameState {
  const phaseState = getResolveMeleePhaseState(state);
  const meleeState = getMeleeResolutionState(state);

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
    unitWithPlacement: UnitWithPlacement,
    attackResult: AttackResult,
    legalRetreatOptionsFromEvent: UnitPlacement[],
  ): AttackApplyState | 'pending' => {
    if (
      !attackResult.unitRouted &&
      !attackResult.unitRetreated &&
      !attackResult.unitReversed
    ) {
      return 'pending';
    }

    let routState: RoutState | 'pending' = 'pending';
    let retreatState: RetreatState | 'pending' = 'pending';
    let reverseState: ReverseState | 'pending' = 'pending';

    if (attackResult.unitRouted) {
      routState = {
        cardsChosen: false,
        completed: false,
        numberToDiscard: 'pending',
        player: unitWithPlacement.unit.playerSide,
        substepType: 'rout',
        unitsToRout: [unitWithPlacement.unit],
      };
    } else if (attackResult.unitRetreated) {
      const legalRetreatOptions = legalRetreatOptionsFromEvent;
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
    } else {
      // Invariant: at least one of rout/retreat/reverse is true (see guard above), and
      // We are not in rout or retreat, so this must be reverse.
      reverseState = {
        completed: false,
        finalPosition: 'pending',
        reversingUnit: unitWithPlacement,
        substepType: 'reverse',
      };
    }

    return {
      attackResult,
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
