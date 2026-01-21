import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the choose melee resolution event. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE =
  'chooseMeleeResolution' as const;

export interface ChooseMeleeResolutionEvent<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE;
  /** The player who is choosing the melee resolution. */
  player: PlayerSide;
  /** The space the melee is occurring in. */
  space: BoardCoordinate<TBoard>;
}

const _chooseMeleeResolutionEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  /** The player who is choosing the melee resolution. */
  player: playerSideSchema,
  /** The space the melee is occurring in. */
  space: boardCoordinateSchema,
});

type ChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _chooseMeleeResolutionEventSchemaObject
>;

const _assertExactChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEvent<Board>,
  ChooseMeleeResolutionEventSchemaType
> = true;

/** The schema for a choose melee resolution event. */
export const chooseMeleeResolutionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseMeleeResolution'>;
  player: typeof playerSideSchema;
  space: typeof boardCoordinateSchema;
}> = _chooseMeleeResolutionEventSchemaObject;
