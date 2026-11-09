import type {
  MoveDelta,
  PlayerSide,
  UnitInstance,
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
  // A stand-in tie between two equally small retreats (§9.1.3): the two a
  // unit on E-5 facing north has when an enemy stands behind it on F-5, as
  // `getLegalRetreats` finds them: to F-6 facing northwest, and to F-4
  // facing northeast.
  const defaultLegalRetreatPaths: MoveDelta[][] = [
    ['turnLeft', 'step'],
    ['turnRight', 'step'],
  ];
  const {
    legalRetreatPaths: overrideLegalRetreatPaths,
    routState: overrideRoutState,
    ...restOverrides
  } = overrides ?? {};
  const legalRetreatPaths =
    overrideLegalRetreatPaths ?? defaultLegalRetreatPaths;
  // A retreat with somewhere to go will never rout, so that slot is bypassed.
  // Nowhere to go leaves the rout pending until triggerRoutFromRetreat opens it.
  const routState =
    overrideRoutState ??
    (legalRetreatPaths.length === 0 ? 'pending' : 'bypassed');
  return {
    completed: false,
    chosenRetreatPath: 'pending',
    legalRetreatPaths,
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
