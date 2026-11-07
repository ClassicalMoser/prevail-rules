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
 * Creates AttackApplyStates for both players. A hit opens the matching rout, retreat, or reverse substep. An attack that reaches no threshold writes a completed apply with those slots `'bypassed'`.
 *
 * @param event - The resolve melee event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply states created for both players
 */
export function applyResolveMeleeEvent<S extends GameState>(
  event: ResolveMeleeEvent,
  state: S,
): S {
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
  ): AttackApplyState => {
    let routState: RoutState | 'pending' | 'bypassed' = 'pending';
    let retreatState: RetreatState | 'pending' | 'bypassed' = 'pending';
    let reverseState: ReverseState | 'pending' | 'bypassed' = 'pending';
    let completed = false;

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
    } else if (attackResult.unitReversed) {
      reverseState = {
        completed: false,
        finalPosition: 'pending',
        reversingUnit: unitWithPlacement.unit,
        substepType: 'reverse',
      };
    } else {
      // A miss has nothing left to apply. The slot must exist so the sequencer
      // does not ask for resolveMelee again, and it is already complete.
      routState = 'bypassed';
      retreatState = 'bypassed';
      reverseState = 'bypassed';
      completed = true;
    }

    const attackApplyState: AttackApplyState = {
      attackResult,
      completed,
      defendingUnit: unitWithPlacement.unit,
      retreatState,
      reverseState,
      routState,
      substepType: 'attackApply',
    };
    return attackApplyState;
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
