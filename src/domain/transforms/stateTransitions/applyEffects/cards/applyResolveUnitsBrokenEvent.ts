import type { ResolveUnitsBrokenEvent } from '@events';
import type { GameState } from '@game';
import { getPlayerUnitsWithPlacementOnBoard } from '@queries';
import { applyUnitsLostSupportAfterRally } from './applyUnitsLostSupportAfterRally';

/**
 * Applies a ResolveUnitsBrokenEvent to the game state.
 * Routes all unit instances of the broken types (removes from board, adds to routed).
 *
 * Prefer the live player-choice path {@link applyAssignUnitSupportEvent}; this
 * remains for registry / legacy type-based generation.
 */
export function applyResolveUnitsBrokenEvent<S extends GameState>(
  event: ResolveUnitsBrokenEvent,
  state: S,
): S {
  const { player, unitTypes } = event;
  const brokenTypeIds = new Set(unitTypes.map((type) => type.id));
  const playerUnits = getPlayerUnitsWithPlacementOnBoard(state, player);
  const uncovered = [...playerUnits]
    .filter((unitWithPlacement) =>
      brokenTypeIds.has(unitWithPlacement.unit.unitType.id),
    )
    .map((u) => u.unit);

  return applyUnitsLostSupportAfterRally(state, player, uncovered);
}
