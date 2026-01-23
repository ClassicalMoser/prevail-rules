import type { Board, PhaseState } from '@entities';

/**
 * Creates a new phase state with the step set to 'complete'.
 * Works for any phase type since all phases have a 'complete' step.
 *
 * @param phaseState - The current phase state
 * @returns A new phase state with step set to 'complete'
 *
 * @example
 * ```ts
 * const completedPhase = markPhaseAsComplete(phaseState);
 * ```
 */
export function markPhaseAsComplete<
  TBoard extends Board,
  TPhaseState extends PhaseState<TBoard>,
>(phaseState: TPhaseState): TPhaseState {
  return {
    ...phaseState,
    step: 'complete',
  } satisfies TPhaseState;
}
