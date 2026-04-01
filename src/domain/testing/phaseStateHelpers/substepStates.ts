import type {
  PlayerSide,
  StandardBoard,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type {
  RallyResolutionState,
  RoutState,
  StandardRetreatState,
  StandardReverseState,
} from '@game';

/**
 * Creates a RetreatState with sensible defaults.
 */
export function createRetreatState(
  unit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<StandardRetreatState>,
): StandardRetreatState {
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
    substepType: 'retreat' as const,
    boardType: 'standard' as const,
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
export function createReverseState(
  unit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<StandardReverseState>,
): StandardReverseState {
  return {
    substepType: 'reverse',
    boardType: 'standard' as const,
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
