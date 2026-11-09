import { getFacingsOneTurnAway } from './getFacingsOneTurnAway';

/**
 * One turn is 45° either way or 180° about (§5.2.1). The set never holds a
 * 90° or 135° facing, which is why wheeling 90° costs two Flexibility.
 */
describe('getFacingsOneTurnAway function', () => {
  it('an orthogonal facing turns to its two neighbours or about', () => {
    expect(getFacingsOneTurnAway('north')).toStrictEqual(
      new Set(['northWest', 'northEast', 'south']),
    );
  });

  it('a diagonal facing turns to its two neighbours or about', () => {
    expect(getFacingsOneTurnAway('southWest')).toStrictEqual(
      new Set(['south', 'west', 'northEast']),
    );
  });

  it('a 90-degree wheel is not reachable in one turn', () => {
    const targets = getFacingsOneTurnAway('north');

    expect(targets.has('east')).toBe(false);
    expect(targets.has('west')).toBe(false);
  });
});
