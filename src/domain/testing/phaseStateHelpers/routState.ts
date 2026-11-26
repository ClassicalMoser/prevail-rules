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
  const opened = createOpenedRoutState(player, [unit]);
  return { ...opened, ...overrides };
}
