/**
 * How a bot leans when the rules leave it a choice. Each trait runs from 0 to
 * 1 and weighs one kind of consideration against the others; none of them
 * changes what the bot is allowed to do, only which of the allowed things it
 * prefers. Two bots with the same temperament play the same way, so a
 * temperament is what a set of bot games is run for.
 */
export interface BotTemperament {
  /**
   * How much it wants to close with the enemy: marching on, engaging, and
   * shooting whenever it can. A bot without it holds its ground and waits
   * to be attacked.
   */
  aggression: number;
  /**
   * How much it guards its own units: keeping flanks and backs out of the
   * enemy's reach, staying within the general's inspiration range, and
   * falling back from a fight it would lose.
   */
  caution: number;
  /**
   * How readily it takes a fight whose outcome is uncertain. A low value
   * engages only where the numbers favour it; a high one accepts an even
   * trade.
   */
  riskTolerance: number;
  /**
   * How tightly it holds its hand, which is its army's will to fight. A
   * thrifty bot commits cards only when the +1 decides a result, and puts off
   * rallying, since every rally burns a card for good.
   */
  thrift: number;
  /**
   * How far it strays from its best-scored choice. At zero it always takes
   * the best; higher values let it pick a near-best option, so its games
   * vary and it cannot be read move by move.
   */
  whimsy: number;
}

/**
 * A steady middle-of-the-road general: willing to fight, careful of its
 * flanks, sparing with its cards, and a little unpredictable.
 */
export const defaultBotTemperament: BotTemperament = {
  aggression: 0.6,
  caution: 0.5,
  riskTolerance: 0.4,
  thrift: 0.6,
  whimsy: 0.15,
};
