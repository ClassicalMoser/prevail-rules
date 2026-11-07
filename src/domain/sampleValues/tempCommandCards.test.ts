import { commandCardSchema } from '@entities';
import { tempCommandCards } from './tempCommandCards';

describe('tempCommandCards catalog', () => {
  it('every sample card satisfies the command card schema', () => {
    // Shape and restriction membership must hold for every sheet row.
    for (const card of tempCommandCards) {
      expect(commandCardSchema.safeParse(card).success).toBe(true);
    }
  });
});
