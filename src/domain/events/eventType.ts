import type { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { AssertExact } from "@utils";
import type { GameEffectEventForBoard, GameEffectType } from "./gameEffects";
import type { PlayerChoiceEventForBoard, PlayerChoiceType } from "./playerChoices";

import { z } from "zod";
import { eventTypes } from "./eventTypeLiterals";
import {
  gameEffectEventSchema,
  largeGameEffectEventSchema,
  smallGameEffectEventSchema,
  standardGameEffectEventSchema,
} from "./gameEffects";
import {
  largePlayerChoiceEventSchema,
  playerChoiceEventSchema,
  smallPlayerChoiceEventSchema,
  standardPlayerChoiceEventSchema,
} from "./playerChoices";

export { eventTypes, GAME_EFFECT_EVENT_TYPE, PLAYER_CHOICE_EVENT_TYPE } from "./eventTypeLiterals";

/** The type of an event. */
export type EventType = (typeof eventTypes)[number];

const _eventTypeSchemaObject = z.enum(eventTypes);
type EventTypeSchemaType = z.infer<typeof _eventTypeSchemaObject>;

const _assertExactEventType: AssertExact<EventType, EventTypeSchemaType> = true;

/** The schema for the type of an event. */
export const eventTypeSchema: z.ZodType<EventType> = _eventTypeSchemaObject;

export type EventUnion<TBoard extends Board> =
  | PlayerChoiceEventForBoard<TBoard, PlayerChoiceType>
  | GameEffectEventForBoard<TBoard, GameEffectType>;

/**
 * Event type filtered by event type.
 * Extracts only the event type that matches the specified eventType.
 * This ensures type safety - Event<TBoard, 'playerChoice'> is ONLY PlayerChoiceEvent.
 */
export type EventForBoard<TBoard extends Board, TEventType extends EventType = EventType> = Extract<
  EventUnion<TBoard>,
  { eventType: TEventType }
>;

export type Event =
  | EventForBoard<SmallBoard>
  | EventForBoard<StandardBoard>
  | EventForBoard<LargeBoard>;

const _smallEventSchemaObject = z.union([smallPlayerChoiceEventSchema, smallGameEffectEventSchema]);

type SmallEventSchemaType = z.infer<typeof _smallEventSchemaObject>;

const _assertExactSmallEvent: AssertExact<EventForBoard<SmallBoard>, SmallEventSchemaType> = true;

export const smallEventSchema: z.ZodType<EventForBoard<SmallBoard>> = _smallEventSchemaObject;

const _standardEventSchemaObject = z.union([
  standardPlayerChoiceEventSchema,
  standardGameEffectEventSchema,
]);

type StandardEventSchemaType = z.infer<typeof _standardEventSchemaObject>;

const _assertExactStandardEvent: AssertExact<
  EventForBoard<StandardBoard>,
  StandardEventSchemaType
> = true;

export const standardEventSchema: z.ZodType<EventForBoard<StandardBoard>> =
  _standardEventSchemaObject;

const _largeEventSchemaObject = z.union([largePlayerChoiceEventSchema, largeGameEffectEventSchema]);

type LargeEventSchemaType = z.infer<typeof _largeEventSchemaObject>;

const _assertExactLargeEvent: AssertExact<EventForBoard<LargeBoard>, LargeEventSchemaType> = true;

export const largeEventSchema: z.ZodType<EventForBoard<LargeBoard>> = _largeEventSchemaObject;

/**
 * Unconstrained union schema object for all events.
 * Uses union to combine the nested discriminated unions:
 * - playerChoiceEventSchema (discriminated by 'choiceType')
 * - gameEffectEventSchema (discriminated by 'effectType')
 *
 * This provides effective double-discrimination:
 * - Top level: `eventType` field distinguishes playerChoice vs gameEffect
 * - Nested level: `choiceType`/`effectType` distinguish specific events
 *
 * TypeScript provides compile-time type safety, and Zod validates the shape
 * at runtime - a gameEffect with wrong eventType won't match playerChoice schemas.
 * The nested discriminated unions provide efficient validation within each category.
 */
const _eventSchemaObject = z.union([playerChoiceEventSchema, gameEffectEventSchema]);

type EventSchemaType = z.infer<typeof _eventSchemaObject>;

const _assertExactEvent: AssertExact<Event, EventSchemaType> = true;

/** The schema for all game events. */
export const eventSchema: z.ZodType<Event> = _eventSchemaObject;
