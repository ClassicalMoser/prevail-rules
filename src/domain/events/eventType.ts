import type { AssertExact } from '@utils';
import type { GameEffectEvent } from './gameEffects';
import type {
  PlayerChoiceEvent,
  ProjectedPlayerChoiceEvent,
} from './playerChoices';

import { z } from 'zod';
import { eventTypes } from './eventTypeLiterals';
import { gameEffectEventSchema } from './gameEffects';
import {
  playerChoiceEventSchema,
  projectedPlayerChoiceEventSchema,
} from './playerChoices';

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

/**
 * An event as a seat or a spectator receives it: a game effect as it is, and a
 * player choice with the secret taken out. Of the choices only `chooseCard` is
 * secret, since a card laid face down stays hidden until the reveal (§4.1.1);
 * commitments and discards are face up (§8) and travel as they are.
 *
 * Every {@link Event} is also a `ProjectedEvent`, since a seat's own choice is
 * not hidden from it.
 */
export type ProjectedEvent = ProjectedPlayerChoiceEvent | GameEffectEvent;

const _projectedEventSchemaObject = z.union([
  projectedPlayerChoiceEventSchema,
  gameEffectEventSchema,
]);

type ProjectedEventSchemaType = z.infer<typeof _projectedEventSchemaObject>;

const _assertExactProjectedEvent: AssertExact<
  ProjectedEvent,
  ProjectedEventSchemaType
> = true;

/** The schema for an event as a seat or a spectator receives it. */
export const projectedEventSchema: z.ZodType<ProjectedEvent> =
  _projectedEventSchemaObject;
