import { unitTypeSchema } from '@entities';
import { tempUnits } from './tempUnits';

describe('tempUnits catalog', () => {
  it('every sample unit satisfies the unit type schema', () => {
    // Shape and trait membership must hold for every sheet row.
    for (const unit of tempUnits) {
      expect(unitTypeSchema.safeParse(unit).success).toBe(true);
    }
  });
});
