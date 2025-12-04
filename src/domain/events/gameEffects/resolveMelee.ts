import type { AssertExact } from '@utils';
import { z } from 'zod';

/** The event for the game resolution of a melee.
 * After the engagement is chosen, supports are applied,
 * and cards are committed, the resolution follows deterministically.
 * The steps are resolved in order, and the player with initiative
 * resolves each step first.
 */

export interface ResolveMeleeEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  /** Whether the white player's unit is routed. */
  whiteUnitRouted: boolean;
  /** Whether the black player's unit is routed. */
  blackUnitRouted: boolean;
  /** Whether the white player's unit is retreated. */
  whiteUnitRetreated: boolean;
  /** Whether the black player's unit is retreated. */
  blackUnitRetreated: boolean;
  /** Whether the white player's unit is reversed. */
  whiteUnitReversed: boolean;
  /** Whether the black player's unit is reversed. */
  blackUnitReversed: boolean;
}

const _resolveMeleeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect' as const),
  /** Whether the white player's unit is routed. */
  whiteUnitRouted: z.boolean(),
  /** Whether the black player's unit is routed. */
  blackUnitRouted: z.boolean(),
  /** Whether the white player's unit is retreated. */
  whiteUnitRetreated: z.boolean(),
  /** Whether the black player's unit is retreated. */
  blackUnitRetreated: z.boolean(),
  /** Whether the white player's unit is reversed. */
  whiteUnitReversed: z.boolean(),
  /** Whether the black player's unit is reversed. */
  blackUnitReversed: z.boolean(),
});

type ResolveMeleeEventSchemaType = z.infer<
  typeof _resolveMeleeEventSchemaObject
>;

const _assertExactResolveMeleeEvent: AssertExact<
  ResolveMeleeEvent,
  ResolveMeleeEventSchemaType
> = true;

/** The schema for a resolve melee event. */
export const resolveMeleeEventSchema: z.ZodType<ResolveMeleeEvent> =
  _resolveMeleeEventSchemaObject;
