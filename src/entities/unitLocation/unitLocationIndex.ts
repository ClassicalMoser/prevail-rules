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
import { unitTypeSchema } from "../unit/unitType.js";

/**
 * ### What is this?
 * A `UnitLocationIndex` is just the board's unitPresence information reshaped
 * for fast lookups. Instead of scanning the whole board, we can jump straight to
 * `index[player][unitTypeId][instanceNumber]` to learn where that specific base
 * stands.
 *
 * ### Why keep it separate?
 * - The board stays the canonical source of truth.
 * - This index is derived when the board changes (setup, move, remove, engage).
 * - Validation / targeting logic can stay O(1) per lookup.
 */

/** Unit type identifiers and instance numbers reuse the canonical unit schemas. */
const unitTypeIdSchema = unitTypeSchema.shape.id;
const unitInstanceNumberKeySchema = unitInstanceSchema.shape.instanceNumber;

/**
 * All instances for a single unit type, keyed by instance number and pointing
 * to the coordinate currently occupied. Numbers are unique only within their
 * unit type, which is why we scope this record under the unit-type map above.
 */
const unitTypeInstanceRecordSchema = z.record(
  unitInstanceNumberKeySchema,
  boardCoordinateSchema
);

/**
 * All unit types for a player, keyed by the unit type's string identifier
 * (matches `UnitType.id`).
 */
const playerUnitLocationSchema = z.record(
  unitTypeIdSchema,
  unitTypeInstanceRecordSchema
);

/**
 * Complete shape keyed by player side. We build it with `reduce` to keep
 * the literal keys ("black", "white") aligned with `playerSide`.
 */
const unitLocationIndexShape = playerSide.reduce(
  (shape, side) => ({
    ...shape,
    [side]: playerUnitLocationSchema,
  }),
  {} as Record<PlayerSide, typeof playerUnitLocationSchema>
);

/**
 * Schema for the derived index. Runtime layers are responsible for keeping it
 * synchronized with the board whenever unit presence changes.
 */
export const unitLocationIndexSchema = z.object(unitLocationIndexShape);

type UnitLocationIndexSchemaType = z.infer<typeof unitLocationIndexSchema>;

/**
 * Type alias for the normalized index (`player -> unit type -> instance -> coordinate`).
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
