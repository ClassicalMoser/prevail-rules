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
} from '@entities';
import type { ResolveMeleeEvent } from '@events';
import {
  getLegalRetreats,
  getMeleeResolutionState,
  getPlayerUnitWithPosition,
  getResolveMeleePhaseState,
} from '@queries';

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

  if (meleeState.whiteAttackApplyState || meleeState.blackAttackApplyState) {
    throw new Error('Attack apply states already exist');
  }

  const meleeCoordinate = event.location;

  // Get both units from the board
  const whiteUnit = getPlayerUnitWithPosition(
    state.boardState,
    meleeCoordinate,
    'white',
  );
  const blackUnit = getPlayerUnitWithPosition(
    state.boardState,
    meleeCoordinate,
    'black',
  );

  if (!whiteUnit || !blackUnit) {
    throw new Error('Units not found on board');
  }

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
    unit: typeof whiteUnit,
    attackResult: AttackResult,
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
      // Calculate legal retreat options
      const legalRetreatOptions = getLegalRetreats(unit, state);

      // Auto-select if only one option, otherwise leave undefined for player choice
      const finalPosition =
        legalRetreatOptions.size === 1
          ? Array.from(legalRetreatOptions)[0]
          : undefined;

      retreatState = {
        substepType: 'retreat',
        retreatingUnit: unit,
        legalRetreatOptions,
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
  );
  const blackAttackApplyState = createAttackApplyState(
    blackUnit,
    blackAttackResult,
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
