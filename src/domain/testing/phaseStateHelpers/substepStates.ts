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
import {
  createOpenedRallyResolutionState,
  createOpenedRetreatState,
  createOpenedReverseState,
  createOpenedRoutState,
} from '@factories';

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
 * @returns The retreat substep, open; with one legal path that path is chosen
 */
export function createRetreatState(
  unit: UnitWithPlacement,
  legalRetreatPaths: MoveDelta[][],
  overrides?: Partial<RetreatState>,
): RetreatState {
  // The retreat as the engine opens it: a single legal path is chosen at once,
  // and the rout slot follows from whether there is anywhere to fall back to.
  const opened = createOpenedRetreatState(unit, legalRetreatPaths);
  return { ...opened, ...overrides };
}

/**
 * Creates a RoutState with sensible defaults.
 */
export function createRoutState(
  player: PlayerSide,
  unit: UnitInstance,
  overrides?: Partial<RoutState>,
): RoutState {
  const opened = createOpenedRoutState(player, [unit]);
  return { ...opened, ...overrides };
}

/**
 * Creates a ReverseState with sensible defaults.
 */
export function createReverseState(
  unit: UnitInstance,
  overrides?: Partial<ReverseState>,
): ReverseState {
  const opened = createOpenedReverseState(unit);
  return { ...opened, ...overrides };
}

/**
 * Creates a RallyResolutionState with sensible defaults.
 */
export function createRallyResolutionState(
  overrides?: Partial<RallyResolutionState>,
): RallyResolutionState {
  const opened = createOpenedRallyResolutionState(false);
  return { ...opened, ...overrides };
}
