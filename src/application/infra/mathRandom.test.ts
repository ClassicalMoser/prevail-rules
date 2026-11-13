import { mathRandom } from './mathRandom';

/** Live play draws from `Math.random`, so every draw is in `[0, 1)`. */
describe('the live-play random source', () => {
  it('draws a number from 0 up to, but not including, 1', () => {
    // A hundred draws, each within the range a procedure expects.
    for (let draw = 0; draw < 100; draw += 1) {
      const value = mathRandom.nextFloat();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
