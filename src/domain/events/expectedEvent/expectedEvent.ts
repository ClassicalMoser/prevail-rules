import type { ExpectedGameEffect } from "./expectedGameEffect";

import type { ExpectedPlayerInput } from "./expectedPlayerInput";

/**
 * Discriminated union of all expected event types.
 * Used by orchestrator to determine what action to take next.
 */
export type ExpectedEventInfo = ExpectedPlayerInput | ExpectedGameEffect;

export type ExpectedEvent = ExpectedEventInfo & {
  expectedEventNumber: number;
};
