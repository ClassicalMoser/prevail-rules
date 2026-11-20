import type { Coordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';

import { coordinateSchema, playerSides } from '@entities';
import { z } from 'zod';

/**
 * Names one unit in the index by who it is: its side, its type's id and its
 * number among that type's copies, as `white-<type id>-2`. Those three are
 * what tell two units apart (a unit's stats come with its type and say
 * nothing more about which one it is), so two units never share a key.
 */
export type UnitIndexKey = `${PlayerSide}-${string}-${number}`;

/**
 * Where one unit is: the space it stands on, still in reserve awaiting setup,
 * or routed and out of the game. Which way it faces is not here; the space
 * holds that, as it does everything else about the unit standing there.
 */
export type UnitIndexEntry = Coordinate | 'reserved' | 'routed';

/**
 * Where one side's commander is: the space it stands on, not yet placed at
 * setup, or lost with a routing unit (§4.2.8) and out of the game.
 */
export type CommanderIndexEntry = Coordinate | 'reserved' | 'lost';

/**
 * Where every piece in the game is, by name.
 *
 * The board, the reserve, the routed units and the lost commanders already
 * say where everything is, and they stay the record. To find one unit from
 * them is to search the whole board, and play asks where a unit or a
 * commander stands constantly: every inspiration range, every stat read in a
 * move. The index answers that by name instead.
 *
 * It is a convenience with a guarantee. Every write to the board or to those
 * lists rebuilds it from what was written, and a full state read from outside
 * is refused unless its index agrees with them, so the index never says
 * anything the record does not.
 */
export interface GameStateIndex {
  /** Every unit in the game, by its key. */
  units: Record<UnitIndexKey, UnitIndexEntry>;
  /** Each side's commander. */
  commanders: Record<PlayerSide, CommanderIndexEntry>;
}

// A side, as the key's first part and as the commanders' keys. Declared here
// as an enum, which a key pattern can be built from.
const sideKeySchema = z.enum(playerSides);

// A unit's key: its side, its type's id and its number, joined by hyphens.
const unitIndexKeySchema = z.templateLiteral([
  sideKeySchema,
  '-',
  z.string(),
  '-',
  z.int(),
]);

const _gameStateIndexSchemaObject = z
  .object({
    units: z.record(
      unitIndexKeySchema,
      z.union([z.literal('reserved'), z.literal('routed'), coordinateSchema]),
    ),
    commanders: z.record(
      sideKeySchema,
      z.union([z.literal('reserved'), z.literal('lost'), coordinateSchema]),
    ),
  })
  .strict();

type GameStateIndexSchemaType = z.infer<typeof _gameStateIndexSchemaObject>;

/**
 * Schema for {@link GameStateIndex}: its shape only. Whether it agrees with
 * the board and the lists is a game rule, checked in `@legality`.
 */
export const gameStateIndexSchema: z.ZodType<GameStateIndex> =
  _gameStateIndexSchemaObject;

const _assertGameStateIndex: AssertExact<
  GameStateIndex,
  GameStateIndexSchemaType
> = true;
