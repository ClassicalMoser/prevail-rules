import { getTurnedFacing } from './getTurnedFacing';

/**
 * One turn is 45° to the unit's own left or right, or 180° about (§5.2.1).
 */
describe('getTurnedFacing function', () => {
  it('a left turn is 45° counterclockwise', () => {
    expect(getTurnedFacing('north', 'turnLeft')).toBe('northWest');
  });

  it('a right turn is 45° clockwise', () => {
    expect(getTurnedFacing('north', 'turnRight')).toBe('northEast');
  });

  it('an about-turn faces the other way', () => {
    expect(getTurnedFacing('northEast', 'turnAbout')).toBe('southWest');
  });

  it('turning wraps round the compass', () => {
    // From northWest, a right turn comes back round to north.
    expect(getTurnedFacing('northWest', 'turnRight')).toBe('north');
    expect(getTurnedFacing('north', 'turnLeft')).toBe('northWest');
  });

  it('two left turns are the 90° wheel that costs two Flexibility', () => {
    const once = getTurnedFacing('north', 'turnLeft');

    expect(getTurnedFacing(once, 'turnLeft')).toBe('west');
  });
});
