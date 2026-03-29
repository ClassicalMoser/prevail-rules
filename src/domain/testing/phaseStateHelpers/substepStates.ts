import type {
  Board,
  PlayerSide,
  StandardBoard,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type {
  RallyResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
} from '@game';
/**
 * Creates a RetreatState with sensible defaults.
 */
export function createRetreatState(
  unit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<RetreatState<StandardBoard>>,
): RetreatState<StandardBoard> {
  const legalRetreatOptions = new Set<UnitPlacement<StandardBoard>>([
    { coordinate: 'E-4' as const, facing: 'north' },
    { coordinate: 'E-6' as const, facing: 'north' },
  ]);
  return {
    substepType: 'retreat' as const,
    retreatingUnit: unit,
    legalRetreatOptions,
    finalPosition: undefined,
    routState: undefined,
    completed: false,
    ...overrides,
  };
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
