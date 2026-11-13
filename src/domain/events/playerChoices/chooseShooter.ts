import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose shooter event. */
export const CHOOSE_SHOOTER_CHOICE_TYPE = 'chooseShooter' as const;

/**
 * The first step of one shot under a Shoot order (§4.3.11 step 1): the
 * player names which of the ordered units shoots next. Its owner may then
 * commit a card for the shot (`commitToRangedAttack`), and only after that
 * names the target and any supporters (`performRangedAttack`).
 *
 * `getLegalRangedAttackers` enumerates the legal options, and
 * `applyChooseShooterEvent` applies the choice.
 */
export interface ChooseShooterEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_SHOOTER_CHOICE_TYPE;
  /** The player carrying out the order. */
  player: PlayerSide;
  /** The unit that shoots next, and where it stands. */
  unit: UnitWithPlacement;
}

const _chooseShooterEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_SHOOTER_CHOICE_TYPE),
    /** The player carrying out the order. */
    player: playerSideSchema,
    /** The unit that shoots next, and where it stands. */
    unit: unitWithPlacementSchema,
  })
  .strict();

type ChooseShooterEventSchemaType = z.infer<
  typeof _chooseShooterEventSchemaObject
>;

const _assertExactChooseShooterEvent: AssertExact<
  ChooseShooterEvent,
  ChooseShooterEventSchemaType
> = true;

/** The schema for a choose shooter event. */
export const chooseShooterEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_SHOOTER_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  unit: typeof unitWithPlacementSchema;
}> = _chooseShooterEventSchemaObject;
