import type { Board } from '@entities/board';
import type { AssertExact } from '@utils';
import type { CleanupPhaseState } from './cleanupPhase';
import type { IssueCommandsPhaseState } from './issueCommandsPhase';
import type { MoveCommandersPhaseState } from './moveCommandersPhase';
import type { PlayCardsPhaseState } from './playCardsPhase';

import type { ResolveMeleePhaseState } from './resolveMeleePhase';
import { z } from 'zod';
import { cleanupPhaseStateSchema } from './cleanupPhase';
import { issueCommandsPhaseStateSchema } from './issueCommandsPhase';
import { moveCommandersPhaseStateSchema } from './moveCommandersPhase';
import { playCardsPhaseStateSchema } from './playCardsPhase';
import { resolveMeleePhaseStateSchema } from './resolveMeleePhase';

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

/** The play cards phase. */
export const PLAY_CARDS_PHASE: 'playCards' = phases[0];

/** The move commanders phase. */
export const MOVE_COMMANDERS_PHASE: 'moveCommanders' = phases[1];

/** The issue commands phase. */
export const ISSUE_COMMANDS_PHASE: 'issueCommands' = phases[2];

/** The resolve melee phase. */
export const RESOLVE_MELEE_PHASE: 'resolveMelee' = phases[3];

/** The cleanup phase. */
export const CLEANUP_PHASE: 'cleanup' = phases[4];

const _phaseSchemaObject = z.enum(phases);
type PhaseSchemaType = z.infer<typeof _phaseSchemaObject>;

/**
 * The schema for a phase of a round.
 */
export const phaseSchema: z.ZodType<Phase> = _phaseSchemaObject;

// Verify manual type matches schema inference
const _assertExactPhase: AssertExact<Phase, PhaseSchemaType> = true;

/** The state of a phase of a round. */
export type PhaseState<TBoard extends Board> =
  | PlayCardsPhaseState
  | MoveCommandersPhaseState
  | IssueCommandsPhaseState
  | ResolveMeleePhaseState<TBoard>
  | CleanupPhaseState;

const _phaseStateSchemaObject = z.discriminatedUnion('phase', [
  playCardsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  issueCommandsPhaseStateSchema,
  resolveMeleePhaseStateSchema,
  cleanupPhaseStateSchema,
]);

type PhaseStateSchemaType = z.infer<typeof _phaseStateSchemaObject>;

const _assertExactPhaseState: AssertExact<PhaseState<Board>, PhaseStateSchemaType> =
  true;

/** The schema for the state of a phase of a round. */
export const phaseStateSchema: z.ZodType<PhaseState<Board>> = _phaseStateSchemaObject;
