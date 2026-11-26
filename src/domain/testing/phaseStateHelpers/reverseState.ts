import type { UnitInstance } from '@entities';
import type { ReverseState } from '@game';
import { createOpenedReverseState } from '@factories';

/**
 * Creates a ReverseState with sensible defaults.
 */
export function createReverseState(
  unit: UnitInstance,
  overrides?: Partial<ReverseState>,
): ReverseState {
  const opened = createOpenedReverseState(unit);
  return { ...opened, ...overrides };
}
