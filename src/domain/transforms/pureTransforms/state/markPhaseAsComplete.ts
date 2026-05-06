import type { Board } from "@entities";
import type { PhaseStateForBoard } from "@game";

/**
 * Creates a new phase state with `step` set to `"complete"`.
 *
 * Uses two type parameters so the **concrete phase branch** is preserved (play cards,
 * issue commands + board, resolve melee + board, cleanup, etc.). A single
 * `PhaseStateForBoard<TBoard>` return widens spatial phases and breaks callers that need
 * `ResolveMeleePhaseStateForBoard<TBoard>` (and similar).
 *
 * The `as TPhase` assertion matches the domain rule that every phase allows a `complete`
 * step; the spread alone does not prove that to TypeScript for generic `TPhase`.
 *
 * @param phaseState - The current phase state
 * @returns The same phase branch with `step: "complete"`
 */
export function markPhaseAsComplete<
  TBoard extends Board,
  TPhase extends PhaseStateForBoard<TBoard>,
>(phaseState: TPhase): TPhase {
  const completedPhase: TPhase = { ...phaseState, step: "complete" };
  return completedPhase;
}
