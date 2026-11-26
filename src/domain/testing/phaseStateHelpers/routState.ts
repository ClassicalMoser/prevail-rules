import type { PlayerSide, UnitInstance } from '@entities';
import type { RoutState } from '@game';
import { createOpenedRoutState } from '@factories';

/**
 * Creates a RoutState with sensible defaults.
 */
export function createRoutState(
  player: PlayerSide,
  unit: UnitInstance,
  overrides?: Partial<RoutState>,
): RoutState {
  // One unit leaving the battle, its Morale not yet counted and no card yet
  // chosen to pay for it (§9.3).
  const opened = createOpenedRoutState(player, [unit]);
  const rout: RoutState = { ...opened, ...overrides };

  // The rout, with whatever the spec changed.
  return rout;
}
