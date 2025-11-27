import type { AssertExact } from "../../utils/assertExact.js";
import type { Board } from "../board/board.js";
import type { BoardCoordinate } from "../board/boardCoordinates.js";
import type { PlayerSide } from "../player/playerSide.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import type { UnitType } from "../unit/unitType.js";
import { z } from "zod";
import { boardCoordinateSchema } from "../board/boardCoordinates.js";
import { playerSide } from "../player/playerSide.js";
import { unitInstanceSchema } from "../unit/unitInstance.js";

const unitInstanceNumberKeySchema = unitInstanceSchema.shape.instanceNumber;

/**
 * Unit location indexes mirror the board's unitPresence data in a normalized,
 * lookup-friendly format. We continue to treat the board as source of truth;
 * this structure is meant to be derived whenever board state changes so that
 * validation logic can perform coordinate lookups without scanning the grid.
 *
 * Shape: player side -> unit type id -> instance number -> coordinate.
 */
const unitTypeInstanceRecordSchema = z.record(
  unitInstanceNumberKeySchema,
  boardCoordinateSchema
);

const playerUnitLocationSchema = z.record(
  z.string(),
  unitTypeInstanceRecordSchema
);

const unitLocationIndexShape = playerSide.reduce(
  (shape, side) => ({
    ...shape,
    [side]: playerUnitLocationSchema,
  }),
  {} as Record<PlayerSide, typeof playerUnitLocationSchema>
);

/**
 * Schema describing the derived index. Runtime layers are responsible for
 * keeping the index in sync with the board whenever units move or leave play.
 */
export const unitLocationIndexSchema = z.object(unitLocationIndexShape);

type UnitLocationIndexSchemaType = z.infer<typeof unitLocationIndexSchema>;

/**
 * Type alias for the normalized index.
 */
export type UnitLocationIndex<TBoard extends Board = Board> = Record<
  PlayerSide,
  Record<
    UnitType["id"],
    Record<UnitInstance["instanceNumber"], BoardCoordinate<TBoard>>
  >
>;

const _assertExactUnitLocationIndex: AssertExact<
  UnitLocationIndex,
  UnitLocationIndexSchemaType
> = true;
