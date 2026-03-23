import type { Board, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import type { AttackResolutionContext } from './attackResolutionContext';
import { unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';

import { z } from 'zod';
import { attackResolutionContextSchema } from './attackResolutionContext';

/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE = 'resolveReverse' as const;

/**
 * Completes a reverse (unit faces the opposite direction) inside attack apply.
 *
 * **Payload rationale**: Reverse can occur under ranged command resolution or under melee.
 * The `attackResolutionContext` field (see `attackResolutionContext.ts`) tells apply which
 * subtree’s `reverseState` to complete so it does not infer that from phase alone.
 */
export interface ResolveReverseEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveReverse' = 'resolveReverse',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /**
   * Ranged vs melee attack-resolution path holding this reverse.
   * Set by `generateResolveReverseEvent` in `src/domain/procedures/`.
   */
  attackResolutionContext: AttackResolutionContext;
  /** The unit that is being reversed. */
  unitInstance: UnitWithPlacement<Board>;
  /** The new unit placement after the reverse. */
  newUnitPlacement: UnitWithPlacement<Board>;
}

const _resolveReverseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  /** Ranged vs melee attack-resolution path holding this reverse. */
  attackResolutionContext: attackResolutionContextSchema,
  /** The unit that is being reversed. */
  unitInstance: unitWithPlacementSchema,
  /** The new unit placement after the reverse. */
  newUnitPlacement: unitWithPlacementSchema,
});

type ResolveReverseEventSchemaType = z.infer<
  typeof _resolveReverseEventSchemaObject
>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent<Board>,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveReverse'>;
  attackResolutionContext: typeof attackResolutionContextSchema;
  unitInstance: typeof unitWithPlacementSchema;
  newUnitPlacement: typeof unitWithPlacementSchema;
}> = _resolveReverseEventSchemaObject;
