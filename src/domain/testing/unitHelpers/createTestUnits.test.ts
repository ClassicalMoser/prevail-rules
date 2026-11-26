import { createTestUnits } from './createTestUnits';

describe('createTestUnits function', () => {
  it('given defaults, creates multiple units with sequential instance numbers', () => {
    const units = createTestUnits('black', 3);
    expect(units).toHaveLength(3);
    expect(units[0].instanceNumber).toBe(1);
    expect(units[1].instanceNumber).toBe(2);
    expect(units[2].instanceNumber).toBe(3);
  });

  it('given pass options to each unit', () => {
    const units = createTestUnits('white', 2, { attack: 3 });
    expect(units[0].unitType.stats.attack).toBe(3);
    expect(units[1].unitType.stats.attack).toBe(3);
  });
});
