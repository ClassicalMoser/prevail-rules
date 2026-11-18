import type { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import type { AssertExact } from '@utils';
import { z } from 'zod';

/** The literal discriminant for the complete unit movement game effect. */
export const COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE =
  'completeUnitMovement' as const;

/**
 * One unit's move under a Move order is finished, before the next unit
 * begins (§4.3.9). A unit that moved into an enemy waited on its own space
 * while the engagement was set up, and steps onto the enemy's space now.
 *
 * `generateCompleteUnitMovementEvent` writes it, and `applyCompleteUnitMovementEvent` applies it.
 */
export interface CompleteUnitMovementEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE;
}

const _completeUnitMovementEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal('gameEffect'),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal('completeUnitMovement'),
  })
  .strict();

type CompleteUnitMovementEventSchemaType = z.infer<
  typeof _completeUnitMovementEventSchemaObject
>;

const _assertExactCompleteUnitMovementEvent: AssertExact<
  CompleteUnitMovementEvent,
  CompleteUnitMovementEventSchemaType
> = true;

/** The schema for a complete unit movement event. */
export const completeUnitMovementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeUnitMovement'>;
}> = _completeUnitMovementEventSchemaObject;
