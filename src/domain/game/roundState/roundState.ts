import type { UnitInstance } from '@entities';
import type { Event, ProjectedEvent } from '@events';
import type { AssertExact } from '@utils';
import type { PhaseState } from '@game/phases';

import { unitInstanceSchema } from '@entities';
import { eventSchema, projectedEventSchema } from '@events';
import { z } from 'zod';
import { phaseStateSchema } from '@game/phases';

/**
 * What every view of a round holds: its number, its phases, and the units
 * commanded so far. A view adds the event log it may read.
 *
 * Board size lives on `boardState.boardType` in game state, not on the round.
 */
export interface RoundStateBase {
  /** The number of the round. */
  roundNumber: number;
  /** The phases that have been completed in the round. */
  completedPhases: PhaseState[];
  /** The state of the current phase of the round. */
  currentPhaseState: PhaseState | 'none';
  /** Units that have been commanded this round. */
  commandedUnits: UnitInstance[];
}

/**
 * The round as the server keeps it: the log holds every event as it was
 * made, a card laid face down included.
 */
export interface AuthoritativeRoundState extends RoundStateBase {
  /** Events applied during this round, in order. */
  events: readonly Event[];
}

/**
 * The round as a seat or a spectator holds it: the log holds each event as
 * that viewer received it, so an opponent's face-down card reads `'hidden'`.
 */
export interface SeenRoundState extends RoundStateBase {
  /** Events applied during this round, in order, as this viewer received them. */
  events: readonly ProjectedEvent[];
}

/** The round of any view. */
export type RoundState = AuthoritativeRoundState | SeenRoundState;

const _roundStateBaseSchemaObject: z.ZodObject<{
  roundNumber: z.ZodInt;
  completedPhases: z.ZodArray<typeof phaseStateSchema>;
  currentPhaseState: z.ZodUnion<
    readonly [typeof phaseStateSchema, z.ZodLiteral<'none'>]
  >;
  commandedUnits: z.ZodArray<typeof unitInstanceSchema>;
}> = z
  .object({
    /** The number of the round. */
    // Setup is round 0, with its own events; the first round to be played is 1.
    roundNumber: z.int().min(0),
    /** The phases that have been completed in the round. */
    completedPhases: z.array(phaseStateSchema),
    /** The state of the current phase of the round. */
    currentPhaseState: phaseStateSchema.or(z.literal('none')),
    /** Units that have been commanded this round. */
    commandedUnits: z.array(unitInstanceSchema),
  })
  .strict();

const _authoritativeRoundStateSchemaObject: z.ZodObject<{
  roundNumber: z.ZodInt;
  completedPhases: z.ZodArray<typeof phaseStateSchema>;
  currentPhaseState: z.ZodUnion<
    readonly [typeof phaseStateSchema, z.ZodLiteral<'none'>]
  >;
  commandedUnits: z.ZodArray<typeof unitInstanceSchema>;
  events: z.ZodReadonly<z.ZodArray<typeof eventSchema>>;
}> = _roundStateBaseSchemaObject.merge(
  z
    .object({
      /** Events applied during this round, in order. */
      events: z.array(eventSchema).readonly(),
    })
    .strict(),
);

type AuthoritativeRoundStateSchemaType = z.infer<
  typeof _authoritativeRoundStateSchemaObject
>;

/** The schema for the round as the server keeps it. */
export const authoritativeRoundStateSchema: typeof _authoritativeRoundStateSchemaObject =
  _authoritativeRoundStateSchemaObject;

const _assertExactAuthoritativeRoundState: AssertExact<
  AuthoritativeRoundState,
  AuthoritativeRoundStateSchemaType
> = true;

const _seenRoundStateSchemaObject: z.ZodObject<{
  roundNumber: z.ZodInt;
  completedPhases: z.ZodArray<typeof phaseStateSchema>;
  currentPhaseState: z.ZodUnion<
    readonly [typeof phaseStateSchema, z.ZodLiteral<'none'>]
  >;
  commandedUnits: z.ZodArray<typeof unitInstanceSchema>;
  events: z.ZodReadonly<z.ZodArray<typeof projectedEventSchema>>;
}> = _roundStateBaseSchemaObject.merge(
  z
    .object({
      /** Events applied during this round, in order, as this viewer received them. */
      events: z.array(projectedEventSchema).readonly(),
    })
    .strict(),
);

type SeenRoundStateSchemaType = z.infer<typeof _seenRoundStateSchemaObject>;

/** The schema for the round as a seat or a spectator holds it. */
export const seenRoundStateSchema: typeof _seenRoundStateSchemaObject =
  _seenRoundStateSchemaObject;

const _assertExactSeenRoundState: AssertExact<
  SeenRoundState,
  SeenRoundStateSchemaType
> = true;

/** The schema for the round of any view. */
export const roundStateSchema: z.ZodType<RoundState> = z.union([
  authoritativeRoundStateSchema,
  seenRoundStateSchema,
]);
