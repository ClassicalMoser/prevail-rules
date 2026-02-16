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
import {
  getMeleeResolutionState,
  getResolveMeleePhaseState,
} from '@queries';

/**
 * Applies a ResolveMeleeEvent to the game state.
 * Creates AttackApplyStates for both players with nested substeps (rout/retreat/reverse) based on the attack results.
 * Uses unit data and legal retreat options from the event rather than querying the board.
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

  if (meleeState.whiteAttackApplyState || meleeState.blackAttackApplyState) {
    throw new Error('Attack apply states already exist');
  }

  // Use unit data from the event
  const whiteUnit = event.whiteUnit as UnitWithPlacement<TBoard>;
  const blackUnit = event.blackUnit as UnitWithPlacement<TBoard>;

  // Create attack results for both units
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

  // Helper function to create attack apply state for a unit
  const createAttackApplyState = (
    unit: UnitWithPlacement<TBoard>,
    attackResult: AttackResult,
    legalRetreats: Set<UnitPlacement<TBoard>>,
  ): AttackApplyState<TBoard> | undefined => {
    if (
      !attackResult.unitRouted &&
      !attackResult.unitRetreated &&
      !attackResult.unitReversed
    ) {
      // No results, don't create attack apply state
      return undefined;
    }

    let routState: RoutState | undefined;
    let retreatState: RetreatState<TBoard> | undefined;
    let reverseState: ReverseState<TBoard> | undefined;

    // Priority: rout > retreat > reverse (rout is most severe)
    if (attackResult.unitRouted) {
      routState = {
        substepType: 'rout',
        player: unit.unit.playerSide,
        unitsToRout: new Set([unit.unit]),
        numberToDiscard: undefined,
        cardsChosen: false,
        completed: false,
      };
    } else if (attackResult.unitRetreated) {
      // Use legal retreat options from the event
      const finalPosition =
        legalRetreats.size === 1
          ? Array.from(legalRetreats)[0]
          : undefined;

      retreatState = {
        substepType: 'retreat',
        retreatingUnit: unit,
        legalRetreatOptions: legalRetreats,
        finalPosition,
        routState: undefined, // Will be created later if no legal retreats
        completed: false,
      };
    } else if (attackResult.unitReversed) {
      reverseState = {
        substepType: 'reverse',
        reversingUnit: unit,
        finalPosition: undefined, // Will be set when reverse is resolved
        completed: false,
      };
    }

    return {
      substepType: 'attackApply',
      defendingUnit: unit.unit,
      attackResult,
      routState,
      retreatState,
      reverseState,
      completed: false,
    };
  };

  // Create attack apply states for both players
  const whiteAttackApplyState = createAttackApplyState(
    whiteUnit,
    whiteAttackResult,
    event.whiteLegalRetreats as Set<UnitPlacement<TBoard>>,
  );
  const blackAttackApplyState = createAttackApplyState(
    blackUnit,
    blackAttackResult,
    event.blackLegalRetreats as Set<UnitPlacement<TBoard>>,
  );

  // Update melee resolution state
  const newMeleeState: MeleeResolutionState<TBoard> = {
    ...meleeState,
    whiteAttackApplyState,
    blackAttackApplyState,
  };

  // Update phase state
  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
