import { traitSchema, traits } from './traits';

describe('traitSchema catalog', () => {
  it('accepts every listed trait', () => {
    // The schema and the catalog share one tuple.
    for (const trait of traits) {
      expect(traitSchema.parse(trait)).toBe(trait);
    }
  });

  it('rejects a string that is not a listed trait', () => {
    // An unknown word is not a unit trait.
    expect(traitSchema.safeParse('not-a-trait').success).toBe(false);
  });
});
