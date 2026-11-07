import {
  LEGAL_INITIATIVES,
  MAX_INITIATIVE_VALUE,
  MIN_INITIATIVE_VALUE,
} from './ruleValues';

describe('legalInitiatives catalog', () => {
  it('lists every integer from the minimum initiative through the maximum', () => {
    // The catalog is built from those bounds, not handwritten.
    const expected = Array.from(
      { length: MAX_INITIATIVE_VALUE - MIN_INITIATIVE_VALUE + 1 },
      (_, index) => MIN_INITIATIVE_VALUE + index,
    );
    expect(LEGAL_INITIATIVES).toStrictEqual(expected);
  });
});
