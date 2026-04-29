import type { Board } from "@entities";
import type { Event, EventType } from "@events";
import { eventSchema } from "@events";
import { z } from "zod";

const eventStreamSchema: z.ZodType<readonly Event<Board, EventType>[]> = z.array(eventSchema);

/**
 * **Boundary:** validates untrusted / stored event stream data.
 * Call after `EventStreamStorage.getEventStream` so downstream code
 * (replay, undo) can trust the events before applying them to state.
 */
export function parseStoredEventStream(data: unknown): readonly Event<Board, EventType>[] {
  const parsed = eventStreamSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
