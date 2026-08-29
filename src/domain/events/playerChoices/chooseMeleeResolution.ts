import type { Coordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { coordinateSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose melee resolution event. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE =
  'chooseMeleeResolution' as const;

export interface ChooseMeleeResolutionEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE;
  /** The space the melee is occurring in. */
  space: Coordinate;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is choosing the melee resolution. */
  player: PlayerSide;
}

const _chooseMeleeResolutionEventSchemaObject = z
  .object({
    choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
    eventNumber: z.number(),
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
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
  choiceType: z.ZodLiteral<typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  player: typeof playerSideSchema;
  space: typeof coordinateSchema;
}> = _chooseMeleeResolutionEventSchemaObject;
