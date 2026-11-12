import { createSeededRandom } from './createSeededRandom';

/**
 * A bot game replays exactly from its seed, which rests on the same seed
 * giving the same draws.
 */
describe('createSeededRandom function', () => {
  it('gives the same draws for the same seed', () => {
    const first = createSeededRandom(7);
    const second = createSeededRandom(7);
    const draws = (source: typeof first) =>
      Array.from({ length: 5 }, () => source.nextFloat());
    expect(draws(first)).toStrictEqual(draws(second));
  });

  it('gives different draws for different seeds', () => {
    expect(createSeededRandom(1).nextFloat()).not.toBe(
      createSeededRandom(2).nextFloat(),
    );
  });

  it('draws only from zero up to but not including one', () => {
    const source = createSeededRandom(3);
    for (let draw = 0; draw < 1000; draw += 1) {
      const value = source.nextFloat();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
