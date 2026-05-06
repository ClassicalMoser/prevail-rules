import { BoardType } from "@entities";
import type { Event } from "@events";
import { eventSchema } from "@events";
import { z } from "zod";

const eventStreamSchema: z.ZodType<readonly Event[]> = z.array(eventSchema);

/**
 * **Boundary:** validates untrusted / stored event stream data.
 * Call after `EventStreamStorage.getEventStream` so downstream code
 * (replay, undo) can trust the events before applying them to state.
 *
 * After Zod parse, requires that every event that carries `boardType` agrees with the others
 * (events without `boardType` are ignored for this check).
 */
export function parseStoredEventStream(data: unknown): readonly Event[] {
  const parsed = eventStreamSchema.parse(data);
  const boardTypes = parsed.flatMap((event): BoardType[] =>
    "boardType" in event ? [event.boardType] : [],
  );
  const distinct = new Set(boardTypes);
  if (distinct.size > 1) {
    throw new Error(`Event stream mixes board types: ${[...distinct].join(", ")}`);
  }
  return parsed;
}
