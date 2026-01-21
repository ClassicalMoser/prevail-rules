import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import type { GameEffectEvent } from './gameEffects';
import type { PlayerChoiceEvent } from './playerChoices';

import { z } from 'zod';
// Direct imports for nested discriminated union schemas to avoid initialization order issues
import { gameEffectEventSchema } from './gameEffects';
import { playerChoiceEventSchema } from './playerChoices';

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

export type Event<TBoard extends Board> =
  | PlayerChoiceEvent<TBoard>
  | GameEffectEvent<TBoard>;

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
const _eventSchemaObject = z.union([
  playerChoiceEventSchema,
  gameEffectEventSchema,
]);

type EventSchemaType = z.infer<typeof _eventSchemaObject>;

const _assertExactEvent: AssertExact<Event<Board>, EventSchemaType> = true;

/** The schema for all game events. */
export const eventSchema: z.ZodType<Event<Board>> = _eventSchemaObject;
