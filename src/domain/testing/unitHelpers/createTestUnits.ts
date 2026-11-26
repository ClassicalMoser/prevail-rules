import type { PlayerSide, UnitInstance, UnitType } from '@entities';
import { createTestUnit } from './createTestUnit';

/**
 * Creates multiple unit instances with sequential instance numbers.
 * This is useful for tests that need multiple units of the same type.
 * Returns an array of unit instances with sequential instance numbers starting from 1.
 * @see createTestUnit - For details on available options
 */
export function createTestUnits(
  playerSide: PlayerSide,
  count: number,
  options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    speed?: number;
    range?: number;
    reverse?: number;
    retreat?: number;
    rout?: number;
    cost?: number;
    limit?: number;
    morale?: number;
  },
): UnitInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUnit(playerSide, {
      ...options,
      instanceNumber: i + 1,
    }),
  );
}
