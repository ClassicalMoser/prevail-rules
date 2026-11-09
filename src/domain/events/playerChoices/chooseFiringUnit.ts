import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose firing unit event. */
export const CHOOSE_FIRING_UNIT_CHOICE_TYPE = 'chooseFiringUnit' as const;

/**
 * The first step of one shot under a Shoot order (§4.3.11 step 1): the
 * player names which of the ordered units fires next. Its owner may then
 * commit a card for the shot (`commitToRangedAttack`), and only after that
 * names the target and any supporters (`performRangedAttack`).
 */
export interface ChooseFiringUnitEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_FIRING_UNIT_CHOICE_TYPE;
  /** The player carrying out the order. */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The unit that fires next, and where it stands. */
  unit: UnitWithPlacement;
}

const _chooseFiringUnitEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(CHOOSE_FIRING_UNIT_CHOICE_TYPE),
    player: playerSideSchema,
    eventNumber: z.number(),
    unit: unitWithPlacementSchema,
  })
  .strict();

type ChooseFiringUnitEventSchemaType = z.infer<
  typeof _chooseFiringUnitEventSchemaObject
>;

const _assertExactChooseFiringUnitEvent: AssertExact<
  ChooseFiringUnitEvent,
  ChooseFiringUnitEventSchemaType
> = true;

/** The schema for a choose firing unit event. */
export const chooseFiringUnitEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_FIRING_UNIT_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  unit: typeof unitWithPlacementSchema;
}> = _chooseFiringUnitEventSchemaObject;
