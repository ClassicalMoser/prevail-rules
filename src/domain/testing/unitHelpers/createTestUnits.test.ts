import { createTestUnits } from './createTestUnits';

/** Several copies of one stand-in, numbered from 1. */
describe('createTestUnits function', () => {
  it('deals copies numbered 1, 2, 3, so no two share an identity', () => {
    const units = createTestUnits('black', 3);
    expect(units).toHaveLength(3);
    expect(units[0].instanceNumber).toBe(1);
    expect(units[1].instanceNumber).toBe(2);
    expect(units[2].instanceNumber).toBe(3);
  });

  it('chooses every copy by the stats a spec asks for', () => {
    const units = createTestUnits('white', 2, { attack: 3 });
    expect(units[0].unitType.stats.attack).toBe(3);
    expect(units[1].unitType.stats.attack).toBe(3);
  });
});
