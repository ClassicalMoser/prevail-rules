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

/** Iterable list of valid phases for a round. */
export const phases = [
  'playCards',
  'moveCommanders',
  'issueCommands',
  'resolveMelee',
  'cleanup',
] as const;

/** The type of a phase of a round. */
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

/** The schema for a phase of a round. */
export const phaseSchema: z.ZodType<Phase> = z.enum(phases);

/**
 * The state of a phase of a round.
 *
 * Discriminated on {@link PhaseState.phase}; nested resolution state hangs
 * off the active step for some phases (issue commands, resolve melee, cleanup).
 */
export type PhaseState =
  | PlayCardsPhaseState
  | MoveCommandersPhaseState
  | IssueCommandsPhaseState
  | ResolveMeleePhaseState
  | CleanupPhaseState;

/** The schema for the state of a phase of a round. */
export const phaseStateSchema: z.ZodType<PhaseState> = z.union([
  playCardsPhaseStateSchema,
  moveCommandersPhaseStateSchema,
  issueCommandsPhaseStateSchema,
  resolveMeleePhaseStateSchema,
  cleanupPhaseStateSchema,
]);
