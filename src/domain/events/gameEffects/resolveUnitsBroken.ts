import type { Board, PlayerSide, UnitType, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitTypeSchema,
  unitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve units broken game effect. */
export const RESOLVE_UNITS_BROKEN_EFFECT_TYPE = 'resolveUnitsBroken' as const;

/** After a player performs a rally, they must check that their
 * hand still supports all unit types in their army. If any unit type
 * is no longer supported, the player must break it, routing all instances
 * of that unit type.
 */

/** An event to resolve units that are no longer supported. */
export interface ResolveUnitsBrokenEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveUnitsBroken' = 'resolveUnitsBroken',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_UNITS_BROKEN_EFFECT_TYPE;
  /** The player whose units are being checked. */
  player: PlayerSide;
  /** The unit types that are broken. */
  unitTypes: UnitType[];
  /** The unit instances with placements to rout (all instances of broken types). */
  unitsToRout: UnitWithPlacement<Board>[];
  /** Total rout penalty from all broken units. */
  totalRoutPenalty: number;
}

const _resolveUnitsBrokenEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_UNITS_BROKEN_EFFECT_TYPE),
  /** The player whose units are being checked. */
  player: playerSideSchema,
  /** The unit types that are broken. */
  unitTypes: z.array(unitTypeSchema),
  /** The unit instances with placements to rout (all instances of broken types). */
  unitsToRout: z.array(unitWithPlacementSchema),
  /** Total rout penalty from all broken units. */
  totalRoutPenalty: z.number(),
});

type ResolveUnitsBrokenEventSchemaType = z.infer<
  typeof _resolveUnitsBrokenEventSchemaObject
>;

const _assertExactResolveUnitsBrokenEvent: AssertExact<
  ResolveUnitsBrokenEvent<Board>,
  ResolveUnitsBrokenEventSchemaType
> = true;

/** The schema for a resolve units broken event. */
export const resolveUnitsBrokenEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveUnitsBroken'>;
  player: typeof playerSideSchema;
  unitTypes: z.ZodArray<typeof unitTypeSchema>;
  unitsToRout: z.ZodArray<typeof unitWithPlacementSchema>;
  totalRoutPenalty: z.ZodNumber;
}> = _resolveUnitsBrokenEventSchemaObject;
