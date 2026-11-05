import { createUnitPlacement } from './createUnitPlacement';

describe('createUnitPlacement function', () => {
  it('returns the coordinate and facing it was given', () => {
    expect.hasAssertions();

    const placement = createUnitPlacement('E-5', 'north');

    expect(placement).toStrictEqual({ coordinate: 'E-5', facing: 'north' });
  });

  it('keeps a diagonal facing', () => {
    expect.hasAssertions();

    const placement = createUnitPlacement('A-1', 'southWest');

    expect(placement).toStrictEqual({ coordinate: 'A-1', facing: 'southWest' });
  });
});
