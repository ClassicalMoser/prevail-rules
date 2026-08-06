import type { AssertExact } from '@utils';
import type { GameEffectEvent } from './gameEffects';
import type { PlayerChoiceEvent } from './playerChoices';

import { z } from 'zod';
import { eventTypes } from './eventTypeLiterals';
import { gameEffectEventSchema } from './gameEffects';
import { playerChoiceEventSchema } from './playerChoices';

export {
  eventTypes,
  GAME_EFFECT_EVENT_TYPE,
  PLAYER_CHOICE_EVENT_TYPE,
} from './eventTypeLiterals';

/** The type of an event. */
export type EventType = (typeof eventTypes)[number];

const _eventTypeSchemaObject = z.enum(eventTypes);
type EventTypeSchemaType = z.infer<typeof _eventTypeSchemaObject>;

const _assertExactEventType: AssertExact<EventType, EventTypeSchemaType> = true;

/** The schema for the type of an event. */
export const eventTypeSchema: z.ZodType<EventType> = _eventTypeSchemaObject;

export type EventUnion = PlayerChoiceEvent | GameEffectEvent;

/**
 * Event type filtered by event type.
 * Extracts only the event type that matches the specified eventType.
 */
export type EventOfType<TEventType extends EventType = EventType> = Extract<
  EventUnion,
  { eventType: TEventType }
>;

export type Event = EventOfType;

/**
 * Unconstrained union schema object for all events.
 * Uses union to combine the nested discriminated unions:
 * - playerChoiceEventSchema (discriminated by 'choiceType')
 * - gameEffectEventSchema (discriminated by 'effectType')
 *
 * This provides effective double-discrimination:
 * - Top level: `eventType` field distinguishes playerChoice vs gameEffect
 * - Nested level: `choiceType`/`effectType` distinguish specific events
 */
const _eventSchemaObject = z.union([
  playerChoiceEventSchema,
  gameEffectEventSchema,
]);

type EventSchemaType = z.infer<typeof _eventSchemaObject>;

const _assertExactEvent: AssertExact<Event, EventSchemaType> = true;

/** The schema for all game events. */
export const eventSchema: z.ZodType<Event> = _eventSchemaObject;
