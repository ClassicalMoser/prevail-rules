import type { Coordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { coordinateSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose melee resolution event. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE =
  'chooseMeleeResolution' as const;

/**
 * In Phase 4 the first player names the engaged space to fight next, until
 * none are left (§4.4.2, §7.2.4). The order is a real choice: support is
 * counted afresh for each fight, so clearing one unit away can change every
 * fight after it (§7.3.3).
 */
export interface ChooseMeleeResolutionEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE;
  /** The player who is choosing the melee resolution. */
  player: PlayerSide;
  /** The space the melee is occurring in. */
  space: Coordinate;
}

const _chooseMeleeResolutionEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
    player: playerSideSchema,
    space: coordinateSchema,
  })
  .strict();

type ChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _chooseMeleeResolutionEventSchemaObject
>;

const _assertExactChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEvent,
  ChooseMeleeResolutionEventSchemaType
> = true;

/** The schema for a choose melee resolution event. */
export const chooseMeleeResolutionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  space: typeof coordinateSchema;
}> = _chooseMeleeResolutionEventSchemaObject;
