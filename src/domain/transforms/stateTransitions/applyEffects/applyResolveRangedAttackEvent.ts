import type {
  AttackApplyState,
  AttackResult,
  Board,
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
  UnitPlacement,
} from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
} from '@queries';

/**
 * Applies a ResolveRangedAttackEvent to the game state.
 * Creates the AttackApplyState with nested substeps (rout/retreat/reverse) based on the attack results.
 * Uses unit placement and legal retreat options from the event rather than querying the board.
 *
 * @param event - The resolve ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply state created
 */
export function applyResolveRangedAttackEvent<TBoard extends Board>(
  event: ResolveRangedAttackEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const rangedAttackState = getRangedAttackResolutionState(state);

  if (rangedAttackState.attackApplyState) {
    throw new Error('Attack apply state already exists');
  }

  const defendingUnit = event.unitInstance;
  const attackResult: AttackResult = {
    unitRouted: event.routed,
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
  };

  // Use placement data from the event
  const unitWithPlacement = {
    unit: defendingUnit,
    placement: event.unitPlacement as UnitPlacement<TBoard>,
  };

  // Create nested substeps based on attack results
  // Priority: rout > retreat > reverse (rout is most severe)
  let routState: RoutState | undefined;
  let retreatState: RetreatState<TBoard> | undefined;
  let reverseState: ReverseState<TBoard> | undefined;

  if (attackResult.unitRouted) {
    // Create rout state
    routState = {
      substepType: 'rout',
      player: defendingUnit.playerSide,
      unitsToRout: new Set([defendingUnit]),
      numberToDiscard: undefined,
      cardsChosen: false,
      completed: false,
    };
  } else if (attackResult.unitRetreated) {
    // Use legal retreat options from the event
    const legalRetreatOptions = event.legalRetreats as Set<UnitPlacement<TBoard>>;

    // Auto-select if only one option, otherwise leave undefined for player choice
    const finalPosition =
      legalRetreatOptions.size === 1
        ? Array.from(legalRetreatOptions)[0]
        : undefined;

    // Create retreat state
    retreatState = {
      substepType: 'retreat',
      retreatingUnit: unitWithPlacement,
      legalRetreatOptions,
      finalPosition,
      routState: undefined, // Will be created later if no legal retreats
      completed: false,
    };
  } else if (attackResult.unitReversed) {
    // Create reverse state
    reverseState = {
      substepType: 'reverse',
      reversingUnit: unitWithPlacement,
      finalPosition: undefined, // Will be set when reverse is resolved
      completed: false,
    };
  }

  // Create attack apply state
  const attackApplyState: AttackApplyState<TBoard> = {
    substepType: 'attackApply',
    defendingUnit,
    attackResult,
    routState,
    retreatState,
    reverseState,
    completed: false,
  };

  // Update ranged attack resolution state
  const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
    ...rangedAttackState,
    attackApplyState,
  };

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
