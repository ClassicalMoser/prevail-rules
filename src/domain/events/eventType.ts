import type { AssertExact } from '@utils';
import { z } from 'zod';

/** Iterable list of valid types of events. */
export const eventTypes = ['playerChoice', 'gameEffect'] as const;

/** The type of an event. */
export type EventType = (typeof eventTypes)[number];

/** The player choice event type. */
export const PLAYER_CHOICE_EVENT_TYPE: 'playerChoice' = eventTypes[0];

/** The game effect event type. */
export const GAME_EFFECT_EVENT_TYPE: 'gameEffect' = eventTypes[1];

const _eventTypeSchemaObject = z.enum(eventTypes);
type EventTypeSchemaType = z.infer<typeof _eventTypeSchemaObject>;

const _assertExactEventType: AssertExact<EventType, EventTypeSchemaType> = true;

/** The schema for the type of an event. */
export const eventTypeSchema: z.ZodType<EventType> = _eventTypeSchemaObject;
