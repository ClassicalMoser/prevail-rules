import type { PlayerSide } from '@entities';
import { coordinateSchema } from '@ruleValues';
import type { Coordinate } from '@ruleValues';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the move commander player choice. */
export const MOVE_COMMANDER_CHOICE_TYPE = 'moveCommander' as const;

/**
 * In Phase 2 a player moves their general, up to four spaces, a diagonal step
 * counting as one (§4.2.2). Where the general stands decides which units its
 * cards' inspiration ranges reach this round (§4.2.7).
 *
 * `getLegalCommanderMoves` enumerates the legal destinations, and
 * `applyMoveCommanderEvent` applies the choice. The event names only where
 * the commander goes: where it set out from is the board's to say, read from
 * the game state's index.
 */
export interface MoveCommanderEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof MOVE_COMMANDER_CHOICE_TYPE;
  /** The player who is moving the commander. */
  player: PlayerSide;
  /** The space the commander moves to. It may be the space it is in (§4.2.6). */
  to: Coordinate;
}

const _moveCommanderEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(MOVE_COMMANDER_CHOICE_TYPE),
    /** The player who is moving the commander. */
    player: playerSideSchema,
    /** The space the commander moves to. It may be the space it is in (§4.2.6). */
    to: coordinateSchema,
  })
  .strict();

type MoveCommanderEventSchemaType = z.infer<
  typeof _moveCommanderEventSchemaObject
>;

const _assertExactMoveCommanderEvent: AssertExact<
  MoveCommanderEvent,
  MoveCommanderEventSchemaType
> = true;

/** The schema for a move commander event. */
export const moveCommanderEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_COMMANDER_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  to: typeof coordinateSchema;
}> = _moveCommanderEventSchemaObject;
