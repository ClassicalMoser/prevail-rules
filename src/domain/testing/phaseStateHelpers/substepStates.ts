import type {
  PlayerSide,
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
  unit: UnitWithPlacement,
  overrides?: Partial<RetreatState>,
): RetreatState {
  const defaultLegalRetreatOptions: UnitPlacement[] = [
    {
      coordinate: 'E-4' as const,
      facing: 'north',
    },
    {
      coordinate: 'E-6' as const,
      facing: 'north',
    },
  ];
  const {
    legalRetreatOptions: overrideLegalRetreatOptions,
    routState: overrideRoutState,
    ...restOverrides
  } = overrides ?? {};
  const legalRetreatOptions =
    overrideLegalRetreatOptions ?? defaultLegalRetreatOptions;
  // A retreat with somewhere to go will never rout, so that slot is bypassed.
  // Nowhere to go leaves the rout pending until triggerRoutFromRetreat opens it.
  const routState =
    overrideRoutState ??
    (legalRetreatOptions.length === 0 ? 'pending' : 'bypassed');
  return {
    completed: false,
    finalPosition: 'pending',
    legalRetreatOptions,
    retreatingUnit: unit,
    routState,
    substepType: 'retreat' as const,
    ...restOverrides,
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
    numberToDiscard: 'pending',
    player,
    substepType: 'rout',
    unitsToRout: [unit],
    ...overrides,
  };
}

/**
 * Creates a ReverseState with sensible defaults.
 */
export function createReverseState(
  unit: UnitInstance,
  overrides?: Partial<ReverseState>,
): ReverseState {
  return {
    completed: false,
    finalPosition: 'pending',
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
    routState: 'pending',
    unitsLostSupport: 'pending',
    ...overrides,
  };
}
