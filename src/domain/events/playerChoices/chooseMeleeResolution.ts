import type { PlayerSide } from '@entities';
import { coordinateSchema } from '@ruleValues';
import type { Coordinate } from '@ruleValues';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the choose melee resolution player choice. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE =
  'chooseMeleeResolution' as const;

/**
 * In Phase 4 the first player names the engaged space to fight next, until
 * none are left (§4.4.2, §7.2.4). The order is a real choice: support is
 * counted afresh for each fight, so clearing one unit away can change every
 * fight after it (§7.3.3).
 *
 * `getLegalChooseMeleeResolutionEvents` enumerates the legal options, and
 * `applyChooseMeleeEvent` applies the choice.
 */
export interface ChooseMeleeResolutionEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE;
  /** The first player, who chooses the order (§4.4.2). */
  player: PlayerSide;
  /** The engaged space to fight next. */
  space: Coordinate;
}

const _chooseMeleeResolutionEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
    /** The first player, who chooses the order (§4.4.2). */
    player: playerSideSchema,
    /** The engaged space to fight next. */
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
