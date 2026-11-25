import { createUnitPlacement } from './createUnitPlacement';

describe('createUnitPlacement function', () => {
  it('returns the coordinate and facing it was given', () => {
    const placement = createUnitPlacement('E-5', 'north');

    expect(placement).toStrictEqual({ coordinate: 'E-5', facing: 'north' });
  });
});
