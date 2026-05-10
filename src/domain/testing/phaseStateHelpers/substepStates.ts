import type {
  PlayerSide,
  StandardBoard,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type {
  RallyResolutionState,
  RetreatStateForBoard,
  ReverseStateForBoard,
  RoutState,
} from '@game';

/**
 * Creates a RetreatState with sensible defaults.
 */
export function createRetreatState(
  unit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<RetreatStateForBoard<StandardBoard>>,
): RetreatStateForBoard<StandardBoard> {
  const legalRetreatOptions = new Set<UnitPlacement<StandardBoard>>([
    {
      boardType: 'standard' as const,
      coordinate: 'E-4' as const,
      facing: 'north',
    },
    {
      boardType: 'standard' as const,
      coordinate: 'E-6' as const,
      facing: 'north',
    },
  ]);
  return {
    boardType: 'standard' as const,
    completed: false,
    finalPosition: undefined,
    legalRetreatOptions,
    retreatingUnit: unit,
    routState: undefined,
    substepType: 'retreat' as const,
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
    cardsChosen: false,
    completed: false,
    numberToDiscard: undefined,
    player,
    substepType: 'rout',
    unitsToRout: new Set([unit]),
    ...overrides,
  };
}

/**
 * Creates a ReverseState with sensible defaults.
 */
export function createReverseState(
  unit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<ReverseStateForBoard<StandardBoard>>,
): ReverseStateForBoard<StandardBoard> {
  return {
    boardType: 'standard' as const,
    completed: false,
    finalPosition: undefined,
    reversingUnit: unit,
    substepType: 'reverse',
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
    completed: false,
    playerRallied: false,
    rallyResolved: false,
    routState: undefined,
    unitsLostSupport: undefined,
    ...overrides,
  };
}
