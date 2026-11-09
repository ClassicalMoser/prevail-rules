import type { MoveDelta, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the move unit event. */
export const MOVE_UNIT_CHOICE_TYPE = 'moveUnit' as const;

/**
 * The last step of moving one unit under a Move order (§4.3.10): the move
 * itself. The unit was named by `chooseMovingUnit` and any card committed
 * by `commitToMovement`, so this event carries only the path, and whether
 * the commander rides along.
 */
export interface MoveUnitEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_UNIT_CHOICE_TYPE;
  /** The player who is moving the unit. */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /**
   * The whole move, step by step and turn by turn (A11). Where the unit
   * ends is wherever the path leaves it; an oblique front approach to an
   * enemy ends with its squaring turn (§6.2.3). An empty path stands the
   * unit in place.
   */
  path: MoveDelta[];
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
}

const _moveUnitEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
    player: playerSideSchema,
    eventNumber: z.number(),
    moveCommander: z.boolean(),
    path: z.array(moveDeltaSchema),
  })
  .strict();

type MoveUnitEventSchemaType = z.infer<typeof _moveUnitEventSchemaObject>;

const _assertExactMoveUnitEvent: AssertExact<
  MoveUnitEvent,
  MoveUnitEventSchemaType
> = true;

/** The schema for a move unit event. */
export const moveUnitEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  moveCommander: z.ZodBoolean;
  path: z.ZodArray<typeof moveDeltaSchema>;
}> = _moveUnitEventSchemaObject;
