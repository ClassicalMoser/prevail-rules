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
 * Creates a RetreatState for a unit forced back by combat (§9.1).
 *
 * The legal paths are the engine's answer for the unit's board, so the caller
 * supplies them (see `legalRetreatsOf`) rather than this fixture inventing a
 * retreat the rules might not offer.
 *
 * @param unit - The retreating unit and where it stands
 * @param legalRetreatPaths - The paths the engine offers it; empty when it cannot retreat
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The retreat substep, open and with no path chosen
 */
export function createRetreatState(
  unit: UnitWithPlacement,
  legalRetreatPaths: MoveDelta[][],
  overrides?: Partial<RetreatState>,
): RetreatState {
  const { routState: overrideRoutState, ...restOverrides } = overrides ?? {};
  // A unit with somewhere to fall back to does not rout, so that slot is
  // bypassed (§9.1). A unit with nowhere to go routs instead (§9.1.6), which
  // leaves the rout pending until triggerRoutFromRetreat opens it.
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
