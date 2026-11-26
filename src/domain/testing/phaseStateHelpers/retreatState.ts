import type { MoveDelta, UnitInstance } from '@entities';
import type { RetreatState } from '@game';
import { createOpenedRetreatState } from '@factories';

/**
 * Creates a RetreatState for a unit forced back by combat (§9.1).
 *
 * The legal paths are the engine's answer for the unit's board, so the caller
 * supplies them (see `legalRetreatsOf`) rather than this fixture inventing a
 * retreat the rules might not offer.
 *
 * @param unit - The retreating unit
 * @param legalRetreatPaths - The paths the engine offers it; empty when it cannot retreat
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The retreat substep, open; with one legal path that path is chosen
 */
export function createRetreatState(
  unit: UnitInstance,
  legalRetreatPaths: MoveDelta[][],
  overrides?: Partial<RetreatState>,
): RetreatState {
  // The retreat as the engine opens it: a single legal path is chosen at once,
  // and the rout slot follows from whether there is anywhere to fall back to.
  const opened = createOpenedRetreatState(unit, legalRetreatPaths);
  const retreat: RetreatState = { ...opened, ...overrides };
  return retreat;
}
