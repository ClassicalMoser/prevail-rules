import type { PlayerSide } from '@entities';
import type {
  CommanderIndexEntry,
  GameState,
  UnitIndexEntry,
  UnitIndexKey,
} from '@game';
import { createUnitIndexKey } from '@factories';
import { getBoardCoordinates } from '../board/getBoardCoordinates';
import { getBoardSpace } from '../board/getBoardSpace';
import { hasEngagedUnits } from '../unitPresence/hasEngagedUnits';
import { hasSingleUnit } from '../unitPresence/hasSingleUnit';

/** One place the record puts a unit. */
export interface UnitPlace {
  piece: 'unit';
  key: UnitIndexKey;
  entry: UnitIndexEntry;
}

/** One place the record puts a side's commander. */
export interface CommanderPlace {
  piece: 'commander';
  side: PlayerSide;
  entry: CommanderIndexEntry;
}

/**
 * Every place the record puts a piece, read from the record itself: the
 * reserve, the routed units, the lost commanders and the board, in that
 * order. The index is derived from this, and the check that a full state is
 * whole reads it too, so the two can never disagree about what the record
 * says.
 *
 * A piece the record holds in two places is listed twice. Play never writes
 * such a state, as each piece changes place in one write, but one read from
 * outside may hold it; listing both is how the check on such a state sees
 * it, and refuses it.
 *
 * A commander neither on the board nor lost is not listed: it has not been
 * placed yet, and that is the index's own default.
 *
 * @param state - The game whose pieces to list
 * @returns Each place a piece is held, the board's last
 */
export function listPiecePlaces(
  state: GameState,
): (UnitPlace | CommanderPlace)[] {
  const places: (UnitPlace | CommanderPlace)[] = [];

  // Units waiting to be placed at setup.
  for (const unit of state.reservedUnits) {
    places.push({
      entry: 'reserved',
      key: createUnitIndexKey(unit),
      piece: 'unit',
    });
  }

  // Units routed and out of the game.
  for (const unit of state.routedUnits) {
    places.push({
      entry: 'routed',
      key: createUnitIndexKey(unit),
      piece: 'unit',
    });
  }

  // Commanders lost with a routing unit, and out of the game.
  for (const side of state.lostCommanders) {
    places.push({ entry: 'lost', piece: 'commander', side });
  }

  // Everything standing on the board, space by space.
  const board = state.boardState;
  for (const coordinate of getBoardCoordinates(board)) {
    const { commanders, unitPresence } = getBoardSpace(board, coordinate);

    // A lone unit stands here.
    if (hasSingleUnit(unitPresence)) {
      places.push({
        entry: coordinate,
        key: createUnitIndexKey(unitPresence.unit),
        piece: 'unit',
      });
    }

    // Two engaged units share the space; both stand here.
    if (hasEngagedUnits(unitPresence)) {
      places.push(
        {
          entry: coordinate,
          key: createUnitIndexKey(unitPresence.primaryUnit),
          piece: 'unit',
        },
        {
          entry: coordinate,
          key: createUnitIndexKey(unitPresence.secondaryUnit),
          piece: 'unit',
        },
      );
    }

    // Commanders stand apart from units, any number to a space.
    for (const side of commanders) {
      places.push({ entry: coordinate, piece: 'commander', side });
    }
  }

  return places;
}
