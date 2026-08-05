import type { Event } from '@events';
import { eventSchema } from '@events';
import { z } from 'zod';

const eventStreamSchema: z.ZodType<readonly Event[]> = z.array(eventSchema);

/**
 * **Boundary:** validates untrusted / stored event stream data.
 * Call after `EventStreamStorage.getEventStream` so downstream code
 * (replay, undo) can trust the events before applying them to state.
 */
export function parseStoredEventStream(data: unknown): readonly Event[] {
  return eventStreamSchema.parse(data);
}
