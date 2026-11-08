import type { PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getBoardCoordinates } from '../board/getBoardCoordinates';
import { getBoardSpace } from '../board/getBoardSpace';
import { hasEngagedUnits } from '../unitPresence/hasEngagedUnits';
import { isFriendlyUnit } from './isFriendlyUnit';
import { hasSingleUnit } from '../unitPresence/hasSingleUnit';

/**
 * Gets all unit instances for a player that are currently on the board.
 *
 * @param state - The current game state
 * @param player - The player whose units to get
 * @returns Set of unit instances on the board belonging to the player
 *
 * @example
 * ```typescript
 * const units = getPlayerUnitsOnBoard(state, 'white');
 * // Returns Set([unitInstance1, unitInstance2, ...])
 * ```
 */
// TODO(composition): a second board walk for "this side's units on the
// board"; `getPlayerUnitsWithPlacementOnBoard` answers it through
// `getPlayerUnitWithPosition`. Settled by one owning the definition.
export function getPlayerUnitsOnBoard(
  state: GameState,
  player: PlayerSide,
): Set<UnitInstance> {
  const units = new Set<UnitInstance>();
  const coordinates = getBoardCoordinates(state.boardState);

  for (const coordinate of coordinates) {
    const space = getBoardSpace(state.boardState, coordinate);
    const { unitPresence } = space;

    // An empty space matches neither guard and adds nothing.
    if (
      hasSingleUnit(unitPresence) &&
      isFriendlyUnit(unitPresence.unit, player)
    ) {
      units.add(unitPresence.unit);
    }
    if (hasEngagedUnits(unitPresence)) {
      if (isFriendlyUnit(unitPresence.primaryUnit, player)) {
        units.add(unitPresence.primaryUnit);
      }
      if (isFriendlyUnit(unitPresence.secondaryUnit, player)) {
        units.add(unitPresence.secondaryUnit);
      }
    }
  }

  return units;
}
