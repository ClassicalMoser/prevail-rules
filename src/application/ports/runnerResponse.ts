import { z } from 'zod';
import type { PortSuccessResponse } from './portResponse';

/**
 * Why the runner could not do what it was asked, one name per cause, so a
 * server can answer each cause its own way without reading the message:
 *
 * - `gameNotFound`: storage holds no game under that id.
 * - `illegalGame`: the game is not a legal one. On a load, the stored record
 *   is broken; on `startNewGame`, the game asked for breaks the army rules.
 * - `gameModeMismatch`: the game is legal, but in another mode than the one
 *   named.
 * - `storage`: the storage itself refused or failed; its reason is kept.
 * - `choiceRefused`: the rules refused a player's choice: not the one owed,
 *   not well formed, or not legal.
 * - `gameOver`: the game has finished, so it owes nothing more.
 */
export const runnerFailures = [
  'gameNotFound',
  'illegalGame',
  'gameModeMismatch',
  'storage',
  'choiceRefused',
  'gameOver',
] as const;

/** One cause the runner can name for not doing what it was asked. */
export type RunnerFailure = (typeof runnerFailures)[number];

/** The schema for a runner failure's cause, for reading one off the wire. */
export const runnerFailureSchema: z.ZodType<RunnerFailure> =
  z.enum(runnerFailures);

/**
 * The runner's answer when it could not do what it was asked: the cause by
 * name, and a message saying what in particular went wrong.
 */
export interface RunnerFailureResponse {
  result: false;
  /** The cause, for a caller deciding what to do. */
  failure: RunnerFailure;
  /** What in particular went wrong, for a person reading it. */
  errorReason: string;
}

/**
 * The runner's answer to any call: what was asked for, or the cause it could
 * not be done. Storage answers with {@link PortResponse}, which names no
 * cause; the runner names it.
 */
export type RunnerResponse<T> = PortSuccessResponse<T> | RunnerFailureResponse;
