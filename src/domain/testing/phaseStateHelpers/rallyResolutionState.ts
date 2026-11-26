import type { RallyResolutionState } from '@game';
import { createOpenedRallyResolutionState } from '@factories';

/**
 * Creates a RallyResolutionState with sensible defaults.
 */
export function createRallyResolutionState(
  overrides?: Partial<RallyResolutionState>,
): RallyResolutionState {
  // A rally as it begins, the player having declined: nothing burnt, no
  // support assigned and nobody routed. A spec about a rally that went ahead
  // says so in its overrides.
  const opened = createOpenedRallyResolutionState(false);
  const rally: RallyResolutionState = { ...opened, ...overrides };

  // The rally, with whatever the spec changed.
  return rally;
}
