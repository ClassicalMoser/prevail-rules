import type {
  AttackApplyState,
  Board,
  CleanupPhaseState,
  CommandResolutionState,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
  PlayerSide,
  RallyResolutionState,
  ResolveMeleePhaseState,
  RetreatState,
  ReverseState,
  RoutState,
  StandardBoard,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
  RESOLVE_MELEE_PHASE,
} from '@entities';
import { createTestUnit } from './unitHelpers';

/**
 * Creates a PlayCardsPhaseState with sensible defaults.
 */
export function createPlayCardsPhaseState(
  overrides?: Partial<PlayCardsPhaseState>,
): PlayCardsPhaseState {
  return {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
    ...overrides,
  };
}

/**
 * Creates a MoveCommandersPhaseState with sensible defaults.
 */
export function createMoveCommandersPhaseState(
  overrides?: Partial<MoveCommandersPhaseState>,
): MoveCommandersPhaseState {
  return {
    phase: MOVE_COMMANDERS_PHASE,
    step: 'moveFirstCommander',
    ...overrides,
  };
}

/**
 * Creates an IssueCommandsPhaseState with sensible defaults.
 */
export function createIssueCommandsPhaseState(
  state: GameState<StandardBoard>,
  overrides?: Partial<IssueCommandsPhaseState<StandardBoard>>,
): IssueCommandsPhaseState<StandardBoard> {
  return {
    phase: ISSUE_COMMANDS_PHASE,
    step: 'firstPlayerResolveCommands',
    remainingCommandsFirstPlayer: new Set(),
    remainingUnitsFirstPlayer: new Set(),
    remainingCommandsSecondPlayer: new Set(),
    remainingUnitsSecondPlayer: new Set(),
    currentCommandResolutionState: undefined,
    ...overrides,
  };
}

/**
 * Creates a MovementResolutionState with sensible defaults.
 */
export function createMovementResolutionState(
  state: GameState<StandardBoard>,
  overrides?: Partial<
    Extract<
      CommandResolutionState<StandardBoard>,
      { commandResolutionType: 'movement' }
    >
  >,
): Extract<
  CommandResolutionState<StandardBoard>,
  { commandResolutionType: 'movement' }
> {
  return {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'movement' as const,
    movingUnit: {
      unit: createTestUnit('black', { attack: 2 }),
      placement: { coordinate: 'E-5', facing: 'north' },
    },
    targetPlacement: { coordinate: 'E-6', facing: 'north' },
    moveCommander: false,
    commitment: {
      commitmentType: 'completed',
      card: state.cardState.black.inPlay!,
    },
    engagementState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a RangedAttackResolutionState with sensible defaults.
 */
export function createRangedAttackResolutionState(
  state: GameState<StandardBoard>,
  overrides?: Partial<
    Extract<
      CommandResolutionState<StandardBoard>,
      { commandResolutionType: 'rangedAttack' }
    >
  >,
): Extract<
  CommandResolutionState<StandardBoard>,
  { commandResolutionType: 'rangedAttack' }
> {
  return {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'rangedAttack' as const,
    attackingUnit: createTestUnit('black', { attack: 2 }),
    defendingUnit: createTestUnit('white', { attack: 2 }),
    attackingCommitment: {
      commitmentType: 'completed',
      card: state.cardState.black.inPlay!,
    },
    defendingCommitment: {
      commitmentType: 'completed',
      card: state.cardState.white.inPlay!,
    },
    supportingUnits: new Set(),
    attackApplyState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a MeleeResolutionState with sensible defaults.
 */
export function createMeleeResolutionState(
  state: GameState<StandardBoard>,
  overrides?: Partial<MeleeResolutionState<StandardBoard>>,
): MeleeResolutionState<StandardBoard> {
  return {
    substepType: 'meleeResolution' as const,
    location: 'E-5',
    whiteCommitment: {
      commitmentType: 'completed',
      card: state.cardState.white.inPlay!,
    },
    blackCommitment: {
      commitmentType: 'completed',
      card: state.cardState.black.inPlay!,
    },
    whiteAttackApplyState: undefined,
    blackAttackApplyState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a ResolveMeleePhaseState with sensible defaults.
 */
export function createResolveMeleePhaseState(
  state: GameState<StandardBoard>,
  overrides?: Partial<ResolveMeleePhaseState<StandardBoard>>,
): ResolveMeleePhaseState<StandardBoard> {
  return {
    phase: RESOLVE_MELEE_PHASE,
    step: 'resolveMelee',
    currentMeleeResolutionState: createMeleeResolutionState(state),
    remainingEngagements: new Set(),
    ...overrides,
  };
}

/**
 * Creates a CleanupPhaseState with sensible defaults.
 */
export function createCleanupPhaseState(
  overrides?: Partial<CleanupPhaseState>,
): CleanupPhaseState {
  return {
    phase: 'cleanup' as const,
    step: 'discardPlayedCards',
    firstPlayerRallyResolutionState: undefined,
    secondPlayerRallyResolutionState: undefined,
    ...overrides,
  };
}

/**
 * Creates a RetreatState with sensible defaults.
 */
export function createRetreatState(
  unit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<RetreatState<StandardBoard>>,
): RetreatState<StandardBoard> {
  const legalRetreatOptions = new Set<UnitPlacement<StandardBoard>>([
    { coordinate: 'E-4' as const, facing: 'north' },
  ]);
  const retreatState: RetreatState<StandardBoard> = {
    substepType: 'retreat' as const,
    retreatingUnit: unit,
    legalRetreatOptions,
    finalPosition: undefined,
    routState: undefined,
    completed: false,
    ...overrides,
  };
  return retreatState;
}

/**
 * Creates an AttackApplyState with sensible defaults.
 */
export function createAttackApplyState<TBoard extends Board>(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState<TBoard>>,
): AttackApplyState<TBoard> {
  return {
    substepType: 'attackApply' as const,
    defendingUnit,
    attackResult: {
      unitRouted: false,
      unitRetreated: false,
      unitReversed: false,
    },
    routState: undefined,
    retreatState: undefined,
    reverseState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates an AttackApplyState with a retreat state.
 */
export function createAttackApplyStateWithRetreat(
  retreatingUnit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<AttackApplyState<StandardBoard>>,
): AttackApplyState<StandardBoard> {
  return createAttackApplyState(retreatingUnit.unit, {
    attackResult: {
      unitRouted: false,
      unitRetreated: true,
      unitReversed: false,
    },
    retreatState: createRetreatState(retreatingUnit),
    ...overrides,
  });
}

/**
 * Creates a RoutState with sensible defaults.
 */
export function createRoutState(
  player: PlayerSide,
  unit: UnitInstance,
  overrides?: Partial<RoutState>,
): RoutState {
  return {
    substepType: 'rout',
    player,
    unitsToRout: new Set([unit]),
    numberToDiscard: undefined,
    cardsChosen: false,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a ReverseState with sensible defaults.
 */
export function createReverseState<TBoard extends Board>(
  unit: UnitWithPlacement<TBoard>,
  overrides?: Partial<ReverseState<TBoard>>,
): ReverseState<TBoard> {
  return {
    substepType: 'reverse',
    reversingUnit: unit,
    finalPosition: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a RallyResolutionState with sensible defaults.
 */
export function createRallyResolutionState(
  overrides?: Partial<RallyResolutionState>,
): RallyResolutionState {
  return {
    playerRallied: false,
    rallyResolved: false,
    unitsLostSupport: undefined,
    routState: undefined,
    completed: false,
    ...overrides,
  };
}
