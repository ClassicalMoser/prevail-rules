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

/** The schema for the type of an event. */
export const eventTypeSchema: z.ZodType<EventType> = z.enum(eventTypes);

/** Any event, as a round's log records it. */
export type Event = PlayerChoiceEvent | GameEffectEvent;

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

// The same two kinds as eventSchema, the choices in their projected form.
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

/** Every event type the list names has events, and no other. */
const _assertEventTypesMatchEvents: AssertExact<EventType, Event['eventType']> =
  true;
