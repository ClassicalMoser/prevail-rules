import type { PlayerSide, UnitType } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitTypeSchema } from '@entities';
import { z } from 'zod';

/** After a player performs a rally, they must check that their
 * hand still supports all unit types in their army. If any unit type
 * is no longer supported, the player must break it, routing all instances
 * of that unit type.
 */

/** An eventto resolve units that are no longer supported. */
export interface ResolveUnitsBrokenEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  /** The player whose units are being checked. */
  player: PlayerSide;
  /** The unit types that are broken. */
  unitTypes: UnitType[];
}

const _resolveUnitsBrokenEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect' as const),
  /** The player whose units are being checked. */
  player: playerSideSchema,
  /** The unit types that are broken. */
  unitTypes: z.array(unitTypeSchema),
});

type ResolveUnitsBrokenEventSchemaType = z.infer<
  typeof _resolveUnitsBrokenEventSchemaObject
>;

const _assertExactResolveUnitsBrokenEvent: AssertExact<
  ResolveUnitsBrokenEvent,
  ResolveUnitsBrokenEventSchemaType
> = true;

/** The schema for a resolve units broken event. */
export const resolveUnitsBrokenEventSchema: z.ZodType<ResolveUnitsBrokenEvent> =
  _resolveUnitsBrokenEventSchemaObject;
