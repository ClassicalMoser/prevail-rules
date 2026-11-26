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
  // The unit due to turn about where it stands (§9.2.1). Its placement is
  // read from the board when the reverse resolves, after any retreat.
  const opened = createOpenedReverseState(unit);
  const reverse: ReverseState = { ...opened, ...overrides };

  // The reverse, with whatever the spec changed.
  return reverse;
}
