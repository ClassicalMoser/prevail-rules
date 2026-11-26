import type { RallyResolutionState } from '@game';
import { createOpenedRallyResolutionState } from '@factories';

/**
 * Creates a RallyResolutionState with sensible defaults.
 */
export function createRallyResolutionState(
  overrides?: Partial<RallyResolutionState>,
): RallyResolutionState {
  const opened = createOpenedRallyResolutionState(false);
  return { ...opened, ...overrides };
}
