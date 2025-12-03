import type { Phase } from "@entities/sequence/phases.js";
import { phases } from "@entities/sequence/phases.js";

/**
 * Get the next phase in the round.
 * @param currentPhase - The current phase
 * @returns The next phase
 */
export function getNextPhase(currentPhase: Phase): Phase {
  // If the current phase is the last phase, return the first phase
  if (currentPhase === phases[phases.length - 1]) {
    return phases[0];
  }
  // Otherwise, return the next phase
  const currentPhaseIndex = phases.indexOf(currentPhase);
  return phases[currentPhaseIndex + 1];
}
