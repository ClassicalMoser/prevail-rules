import { defaultBotTemperament } from '@bot/temperament';
import { createSeededRandom } from '../runner/createSeededRandom';
import { pickBest } from './pickBest';

/**
 * A bot takes the option it scores best; whimsy may reorder close options
 * but never a clearly better one.
 */
describe('pickBest function', () => {
  const steady = { ...defaultBotTemperament, whimsy: 0 };
  const flighty = { ...defaultBotTemperament, whimsy: 1 };

  it('without whimsy, always takes the best scored option', () => {
    const random = createSeededRandom(1);
    for (let trial = 0; trial < 20; trial += 1) {
      expect(pickBest([1, 3, 2], (option) => option, steady, random)).toBe(3);
    }
  });

  it('even at full whimsy, never prefers an option far worse than the best', () => {
    // Ten points apart is well beyond what whimsy can nudge.
    const random = createSeededRandom(2);
    for (let trial = 0; trial < 50; trial += 1) {
      expect(pickBest([0, 10], (option) => option, flighty, random)).toBe(10);
    }
  });

  it('with whimsy, sometimes takes either of two equal options', () => {
    const random = createSeededRandom(3);
    const picks = new Set(
      Array.from({ length: 40 }, () =>
        pickBest(['a', 'b'], () => 0, flighty, random),
      ),
    );
    expect(picks).toStrictEqual(new Set(['a', 'b']));
  });

  it('throws when offered nothing, since a bot is asked only for a choice it owes', () => {
    expect(() => pickBest([], () => 0, steady, createSeededRandom(4))).toThrow(
      'A bot was asked to choose from nothing',
    );
  });
});
