import type { RandomSource } from '@utils';
import type { BotTemperament } from '@bot/temperament';

/**
 * The most a fully whimsical bot nudges a score, in the points a unit's cost
 * is counted in: about half a typical unit, so whimsy reorders close options
 * but never prefers a poor one to a clearly better one.
 */
const WHIMSY_POINTS = 4;

/**
 * The option a bot takes from those it was offered: the best scored, unless
 * its whimsy lets a near-best one through. Each score is nudged by a random
 * amount up to `whimsy` times a fixed number of points, so a bot with no
 * whimsy always takes the best, and one with some sometimes takes a close
 * second.
 *
 * Only an option the rules offered reaches here, so whatever comes back is
 * legal; the score decides only which legal option the bot prefers.
 *
 * @param options - The options offered; at least one
 * @param score - How much the bot likes an option
 * @param temperament - How far the bot strays from its best
 * @param random - The source of the nudge
 * @returns The option chosen
 * @throws When nothing is offered, since a bot is asked only for a choice it owes
 */
export function pickBest<Option>(
  options: readonly Option[],
  score: (option: Option) => number,
  temperament: BotTemperament,
  random: RandomSource,
): Option {
  if (options.length === 0) {
    throw new Error('A bot was asked to choose from nothing');
  }
  // Score each option once; a score may be costly to work out.
  const scored = options.map((option) => ({ option, score: score(option) }));
  // A fixed reach, not one scaled to the spread of scores: one disastrous
  // option must not widen the nudge enough to make every choice a coin toss.
  const reach = temperament.whimsy * WHIMSY_POINTS;
  let chosen = scored[0];
  let chosenScore = Number.NEGATIVE_INFINITY;
  for (const entry of scored) {
    const nudged = entry.score + random.nextFloat() * reach;
    if (nudged > chosenScore) {
      chosen = entry;
      chosenScore = nudged;
    }
  }
  if (chosen === undefined) {
    throw new Error('A bot was asked to choose from nothing');
  }
  return chosen.option;
}
