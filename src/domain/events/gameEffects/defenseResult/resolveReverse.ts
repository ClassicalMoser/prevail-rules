import type { UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import type { AttackResolutionContext } from './attackResolutionContext';
import { unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';
import { attackResolutionContextSchema } from './attackResolutionContext';

/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE = 'resolveReverse' as const;

export interface ResolveReverseEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /** The unit instance that is being reversed. */
  unitInstance: UnitWithPlacement;
  /** The new unit placement after the reverse. */
  newUnitPlacement: UnitWithPlacement;
  /**
   * Ranged vs melee attack-resolution path holding this reverse.
   * Set by `generateResolveReverseEvent` in `src/domain/procedures/`.
   */
  attackResolutionContext: AttackResolutionContext;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _resolveReverseEventSchemaObject = z.object({
  attackResolutionContext: attackResolutionContextSchema,
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  eventNumber: z.number(),
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  newUnitPlacement: unitWithPlacementSchema,
  unitInstance: unitWithPlacementSchema,
});

type ResolveReverseEventSchemaType = z.infer<
  typeof _resolveReverseEventSchemaObject
>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: z.ZodObject<{
  attackResolutionContext: typeof attackResolutionContextSchema,
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>,
  eventNumber: z.ZodNumber,
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>,
  newUnitPlacement: typeof unitWithPlacementSchema,
  unitInstance: typeof unitWithPlacementSchema,
}> =
  _resolveReverseEventSchemaObject;
