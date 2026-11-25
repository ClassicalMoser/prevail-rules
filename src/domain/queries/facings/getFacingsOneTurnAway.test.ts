import { getFacingsOneTurnAway } from './getFacingsOneTurnAway';

/**
 * One turn is 45° either way or 180° about (§5.2.1). The set never holds a
 * 90° or 135° facing, which is why wheeling 90° costs two Flexibility.
 */
describe('getFacingsOneTurnAway function', () => {
  it('an orthogonal facing turns to its two neighbours or about', () => {
    // From north: north-west, north-east, or about to south. East and west,
    // the 90° wheel, are not among them.
    expect(getFacingsOneTurnAway('north')).toStrictEqual(
      new Set(['northWest', 'northEast', 'south']),
    );
  });

  it('a diagonal facing turns to its two neighbours or about', () => {
    // From south-west: south, west, or about to north-east.
    expect(getFacingsOneTurnAway('southWest')).toStrictEqual(
      new Set(['south', 'west', 'northEast']),
    );
  });
});
