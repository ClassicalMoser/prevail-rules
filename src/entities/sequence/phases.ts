import type {
  CleanupPhaseState,
  IssueCommandsPhaseState,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
  ResolveMeleePhaseState,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  cleanupPhaseStateSchema,
  issueCommandsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  playCardsPhaseStateSchema,
  resolveMeleePhaseStateSchema,
} from '@entities';
import { z } from 'zod';

/**
 * Iterable list of valid phases for a round.
 */
export const phases = [
  'playCards',
  'moveCommanders',
  'issueCommands',
  'resolveMelee',
  'cleanup',
] as const;

/**
 * The type of a phase of a round.
 */
export type Phase = (typeof phases)[number];

const _phaseSchemaObject = z.enum(phases);
type PhaseSchemaType = z.infer<typeof _phaseSchemaObject>;

/**
 * The schema for a phase of a round.
 */
export const phaseSchema: z.ZodType<Phase> = _phaseSchemaObject;

// Verify manual type matches schema inference
const _assertExactPhase: AssertExact<Phase, PhaseSchemaType> = true;

/** The state of a phase of a round. */
export type PhaseState =
  | PlayCardsPhaseState
  | MoveCommandersPhaseState
  | IssueCommandsPhaseState
  | ResolveMeleePhaseState
  | CleanupPhaseState;

const _phaseStateSchemaObject = z.discriminatedUnion('phase', [
  playCardsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  issueCommandsPhaseStateSchema,
  resolveMeleePhaseStateSchema,
  cleanupPhaseStateSchema,
]);

type PhaseStateSchemaType = z.infer<typeof _phaseStateSchemaObject>;

const _assertExactPhaseState: AssertExact<PhaseState, PhaseStateSchemaType> =
  true;

/** The schema for the state of a phase of a round. */
export const phaseStateSchema: z.ZodType<PhaseState> = _phaseStateSchemaObject;
